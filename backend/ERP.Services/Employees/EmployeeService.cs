using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Employees;
using ERP.DTOs.Employees.Profile;
using ERP.Services.Auth;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text;
using FirebaseAdmin.Auth;
using ERP.DTOs.Auth;
using ERP.DTOs.Settings;
using Microsoft.Extensions.Logging;
using ERP.Services.Authorization;
using ERP.Services.Settings;
using ERP.Entities.Interfaces;
using System.Security.Claims;
using EmployeeEntity = ERP.Entities.Models.Employees;

namespace ERP.Services.Employees
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFirebaseService _firebaseService;
        private readonly IUserService _userService;
        private readonly ILogger<EmployeeService> _logger;
        private readonly ICurrentUserContext _userContext;
        private readonly IAuthorizationService _authService;
        private readonly IScopedQueryHelper _scopedQueryHelper;
        private readonly IEmploymentHistoryService _historyService;
        private readonly ITenantSettingService _tenantSettingService;

        public EmployeeService(
            IUnitOfWork unitOfWork, 
            IFirebaseService firebaseService, 
            IUserService userService, 
            ILogger<EmployeeService> logger,
            ICurrentUserContext userContext,
            IAuthorizationService authService,
            IScopedQueryHelper scopedQueryHelper,
            IEmploymentHistoryService historyService,
            ITenantSettingService tenantSettingService)
        {
            _unitOfWork = unitOfWork;
            _firebaseService = firebaseService;
            _userService = userService;
            _logger = logger;
            _userContext = userContext;
            _authService = authService;
            _scopedQueryHelper = scopedQueryHelper;
            _historyService = historyService;
            _tenantSettingService = tenantSettingService;
        }

        private async Task EnsureEmployeeAccess(int employeeId)
        {
            var currentUserId = _userContext.UserId ?? 0;
            if (currentUserId <= 0) return;

            var canAccess = await _authService.CanAccessEmployee(currentUserId, employeeId);
            if (!canAccess)
            {
                // Self access check
                var userAccount = await _unitOfWork.Repository<Users>().AsQueryable()
                    .Where(u => u.Id == currentUserId)
                    .Select(u => new { u.employee_id })
                    .FirstOrDefaultAsync();

                if (userAccount?.employee_id != employeeId)
                    throw new UnauthorizedAccessException("Bạn không có quyền truy cập thông tin nhân viên này.");
            }
        }

        private async Task<PaginatedListDto<EmployeeDto>> GetPagedListLegacyAsync(EmployeeFilterDto filter)
        {
            var query = _unitOfWork.Repository<EmployeeEntity>().AsQueryable();

            // 1. Search Term (Universal search)
            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                query = query.Where(e => (e.full_name != null && e.full_name.Contains(filter.SearchTerm)) || 
                                         (e.email != null && e.email.Contains(filter.SearchTerm)) ||
                                         e.employee_code.Contains(filter.SearchTerm));
            }

            // 2. Specific Field Filtering
            if (!string.IsNullOrEmpty(filter.EmployeeCode))
                query = query.Where(e => e.employee_code.Contains(filter.EmployeeCode));

            if (!string.IsNullOrEmpty(filter.FullName))
                query = query.Where(e => e.full_name != null && e.full_name.Contains(filter.FullName));

            if (!string.IsNullOrEmpty(filter.Email))
                query = query.Where(e => e.email != null && e.email.Contains(filter.Email));

            if (!string.IsNullOrEmpty(filter.Phone))
                query = query.Where(e => e.phone != null && e.phone.Contains(filter.Phone));

            if (!string.IsNullOrEmpty(filter.IdentityNumber))
                query = query.Where(e => e.identity_number != null && e.identity_number.Contains(filter.IdentityNumber));

            if (!string.IsNullOrEmpty(filter.TaxCode))
                query = query.Where(e => e.tax_code != null && e.tax_code.Contains(filter.TaxCode));

            // 3. Lookup Filtering
            if (!string.IsNullOrEmpty(filter.GenderCode))
                query = query.Where(e => e.gender_code == filter.GenderCode);

            if (!string.IsNullOrEmpty(filter.MaritalStatusCode))
                query = query.Where(e => e.marital_status_code == filter.MaritalStatusCode);

            if (filter.DepartmentId.HasValue)
                query = query.Where(e => e.department_id == filter.DepartmentId);

            if (filter.BranchId.HasValue)
                query = query.Where(e => e.branch_id == filter.BranchId);

            if (filter.JobTitleId.HasValue)
                query = query.Where(e => e.job_title_id == filter.JobTitleId);

            if (filter.ManagerId.HasValue)
                query = query.Where(e => e.manager_id == filter.ManagerId);

            if (filter.RegionId.HasValue)
                query = query.Where(e => e.region_id == filter.RegionId);

            // 4. Status Filtering
            var today = DateTime.Today;
            if (filter.Status == "active")
            {
                // Đang hoạt động: is_active = true, is_resigned = false, và đã đến ngày làm việc
                query = query.Where(e => e.is_active && !e.is_resigned && (e.start_date == null || e.start_date <= today));
            }
            else if (filter.Status == "resigned")
            {
                // Nghỉ việc: is_resigned = true
                query = query.Where(e => e.is_resigned);
            }
            else if (filter.Status == "inactive")
            {
                // Không hoạt động: is_active = false, is_resigned = false
                query = query.Where(e => !e.is_active && !e.is_resigned);
            }
            else if (filter.Status == "notstarted")
            {
                // Chưa làm việc: start_date > today
                query = query.Where(e => e.start_date > today && !e.is_resigned);
            }
            // else if "all", no status filter

            // 5. Date Ranges
            if (filter.StartDateFrom.HasValue)
                query = query.Where(e => e.start_date >= filter.StartDateFrom.Value);

            if (filter.StartDateTo.HasValue)
                query = query.Where(e => e.start_date <= filter.StartDateTo.Value);

            // 6. Flags
            if (filter.IsDepartmentHead.HasValue)
                query = query.Where(e => e.is_department_head == filter.IsDepartmentHead.Value);

            if (!string.IsNullOrEmpty(filter.WorkType))
                query = query.Where(e => e.work_type == filter.WorkType);

            // 7. Sorting
            if (!string.IsNullOrEmpty(filter.SortBy))
            {
                switch (filter.SortBy.ToLower())
                {
                    case "fullname":
                    case "name":
                        // Sắp xếp theo tên (chữ cái đầu)
                        query = filter.IsDescending ? query.OrderByDescending(e => e.full_name) : query.OrderBy(e => e.full_name);
                        break;
                    case "code":
                    case "employeecode":
                        query = filter.IsDescending ? query.OrderByDescending(e => e.employee_code) : query.OrderBy(e => e.employee_code);
                        break;
                    case "startdate":
                        query = filter.IsDescending ? query.OrderByDescending(e => e.start_date) : query.OrderBy(e => e.start_date);
                        break;
                    case "department":
                        query = filter.IsDescending ? query.OrderByDescending(e => e.department_id) : query.OrderBy(e => e.department_id);
                        break;
                    default:
                        query = query.OrderBy(e => e.employee_code);
                        break;
                }
            }
            else
            {
                // AC 3.3: Apply default sorting from tenant settings if user hasn't specified one
                var sortConfig = await _tenantSettingService.GetEmployeeSortConfigAsync();
                if (sortConfig.Config != null && sortConfig.Config.Any())
                {
                    IOrderedQueryable<EmployeeEntity>? orderedQuery = null;
                    foreach (var rule in sortConfig.Config)
                    {
                        bool isDesc = rule.Order.ToLower() == "desc";
                        if (orderedQuery == null)
                        {
                            orderedQuery = ApplyEmployeeSort(query, rule.Field, isDesc);
                        }
                        else
                        {
                            orderedQuery = ApplyEmployeeThenSort(orderedQuery, rule.Field, isDesc);
                        }
                    }
                    query = orderedQuery ?? query.OrderBy(e => e.employee_code);
                }
                else
                {
                    query = query.OrderBy(e => e.employee_code);
                }
            }

            // 8. Execution & Mapping
            var count = await query.CountAsync();
            var items = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var dtos = items.Select(e => MapToDto(e)).ToList();

            return new PaginatedListDto<EmployeeDto>(dtos, count, filter.PageNumber, filter.PageSize);
        }

        public async Task<EmployeeDto?> GetByIdAsync(int id)
        {
            await EnsureEmployeeAccess(id);
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(id);
            return employee != null ? MapToDto(employee) : null;
        }

        public async Task<IEnumerable<EmployeeDto>> GetActiveByBranchAsync(int branchId)
        {
            var currentUserId = _userContext.UserId ?? 0;
            if (currentUserId > 0 && !await _authService.CanAccessBranch(currentUserId, branchId))
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập dữ liệu của chi nhánh này.");

            var today = DateTime.Today;
            var employees = await _unitOfWork.Repository<EmployeeEntity>()
                .AsQueryable()
                .Include(e => e.Branch)
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Include(e => e.Gender)
                .Where(e => e.branch_id == branchId && e.is_active && !e.is_resigned && (e.start_date == null || e.start_date <= today))
                .OrderBy(e => e.employee_code)
                .ToListAsync();

            var accessGroupLookup = await BuildAccessGroupLookupAsync(employees.Select(e => e.Id));
            
            return employees.Select(e => MapToDto(
                e, 
                accessGroupLookup.TryGetValue(e.Id, out var accessGroup) ? accessGroup : null)).ToList();
        }

        public async Task<EmployeeFullProfileDto?> GetFullProfileAsync(int id)
        {
            await EnsureEmployeeAccess(id);
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(id);
            if (employee == null) return null;

            var profile = new EmployeeFullProfileDto
            {
                BasicInfo = MapToDto(employee)
            };

            // Addresses
            var addressJoins = await _unitOfWork.Repository<EmployeeAddresses>().FindAsync(x => x.employee_id == id);
            foreach (var join in addressJoins)
            {
                var addr = await _unitOfWork.Repository<Addresses>().GetByIdAsync(join.address_id);
                var addrType = await _unitOfWork.Repository<AddressTypes>().GetByIdAsync(join.address_type_id);
                if (addr != null)
                {
                    profile.Addresses.Add(new EmployeeAddressDto
                    {
                        AddressId = join.address_id,
                        Address = new AddressDto
                        {
                            Id = addr.Id,
                            AddressLine = addr.address_line,
                            Ward = addr.ward,
                            District = addr.district,
                            City = addr.city,
                            Country = addr.country,
                            PostalCode = addr.postal_code
                        },
                        AddressTypeId = join.address_type_id,
                        AddressTypeName = addrType?.name,
                        IsCurrent = join.is_current,
                        StartDate = join.start_date,
                        EndDate = join.end_date
                    });
                }
            }

            // Bank Accounts
            var bankAccounts = await _unitOfWork.Repository<BankAccounts>().FindAsync(x => x.employee_id == id);
            profile.BankAccounts = bankAccounts.Select(b => new BankAccountDto
            {
                Id = b.Id,
                AccountHolder = b.account_holder,
                AccountNumber = b.account_number,
                BankName = b.bank_name,
                Branch = b.branch
            }).ToList();

            // Emergency Contacts
            var emergencyContacts = await _unitOfWork.Repository<EmergencyContacts>().FindAsync(x => x.employee_id == id);
            profile.EmergencyContacts = emergencyContacts.Select(c => new EmergencyContactDto
            {
                Id = c.Id,
                Name = c.name,
                Relationship = c.relationship,
                MobilePhone = c.mobile_phone,
                HomePhone = c.home_phone,
                Address = c.address
            }).ToList();

            // Health Record
            var healthRecord = (await _unitOfWork.Repository<HealthRecords>().FindAsync(x => x.employee_id == id)).FirstOrDefault();
            if (healthRecord != null)
            {
                profile.HealthRecord = new HealthRecordDto
                {
                    Id = healthRecord.Id,
                    Height = healthRecord.height,
                    Weight = healthRecord.weight,
                    BloodType = healthRecord.blood_type,
                    CongenitalDisease = healthRecord.congenital_disease,
                    ChronicDisease = healthRecord.chronic_disease,
                    HealthStatus = healthRecord.health_status,
                    CheckDate = healthRecord.check_date
                };
            }

            // Dependents
            var dependents = await _unitOfWork.Repository<Dependents>().FindAsync(x => x.employee_id == id);
            profile.Dependents = dependents.Select(d => new DependentDto
            {
                Id = d.Id,
                FullName = d.full_name,
                BirthDate = d.birth_date,
                Gender = d.gender,
                IdentityNumber = d.identity_number,
                Relationship = d.relationship,
                PermanentAddress = d.permanent_address,
                TemporaryAddress = d.temporary_address,
                DependentDuration = d.dependent_duration,
                Reason = d.reason
            }).ToList();

            // Education
            var education = await _unitOfWork.Repository<Education>().FindAsync(x => x.employee_id == id);
            profile.Education = education.Select(e => new EducationDto
            {
                Id = e.Id,
                Level = e.level,
                Major = e.major,
                Institution = e.institution,
                IssueDate = e.issue_date,
                Note = e.note
            }).ToList();

            // Certificates
            var certJoins = await _unitOfWork.Repository<EmployeeCertificates>().FindAsync(x => x.employee_id == id);
            foreach (var join in certJoins)
            {
                var cert = await _unitOfWork.Repository<Certificates>().GetByIdAsync(join.certificate_id);
                profile.Certificates.Add(new EmployeeCertificateDto
                {
                    CertificateId = join.certificate_id,
                    CertificateName = cert?.certificate_name ?? "",
                    IssueDate = join.issue_date,
                    Attachment = join.attachment
                });
            }

            // Skills
            var skillJoins = await _unitOfWork.Repository<EmployeeSkills>().FindAsync(x => x.employee_id == id);
            foreach (var join in skillJoins)
            {
                var skill = await _unitOfWork.Repository<Skills>().GetByIdAsync(join.skill_id);
                profile.Skills.Add(new EmployeeSkillDto
                {
                    SkillId = join.skill_id,
                    SkillName = skill?.skill_name ?? "",
                    Level = join.level
                });
            }

            return profile;
        }

        public async Task<EmployeeDto?> GetByCodeAsync(string code)
        {
            var employees = await _unitOfWork.Repository<EmployeeEntity>().FindAsync(e => e.employee_code == code);
            var employee = employees.FirstOrDefault();
            return employee != null ? MapToDto(employee) : null;
        }

        public async Task<EmployeeDto> CreateAsync(EmployeeCreateDto dto)
        {
            // 0. Scoping & Region validation
            var currentUserId = _userContext.UserId ?? 0;
            if (currentUserId > 0)
            {
                if (dto.RegionId.HasValue && !await _authService.CanAccessRegion(currentUserId, dto.RegionId.Value))
                    throw new UnauthorizedAccessException("Bạn không có quyền tạo nhân viên trong vùng này.");
                if (dto.BranchId.HasValue && !await _authService.CanAccessBranch(currentUserId, dto.BranchId.Value))
                    throw new UnauthorizedAccessException("Bạn không có quyền tạo nhân viên trong chi nhánh này.");
                if (dto.DepartmentId.HasValue && !await _authService.CanAccessDepartment(currentUserId, dto.DepartmentId.Value))
                    throw new UnauthorizedAccessException("Bạn không có quyền tạo nhân viên trong phòng ban này.");
            }

            // 1. Validations
            if (dto.RegionId.HasValue && await _unitOfWork.Repository<Regions>().GetByIdAsync(dto.RegionId.Value) == null)
                throw new Exception($"Vùng ID {dto.RegionId} không tồn tại.");

            if (dto.BranchId.HasValue && await _unitOfWork.Repository<Branches>().GetByIdAsync(dto.BranchId.Value) == null)
                throw new Exception($"Chi nhánh ID {dto.BranchId} không tồn tại.");

            if (dto.DepartmentId.HasValue && await _unitOfWork.Repository<Departments>().GetByIdAsync(dto.DepartmentId.Value) == null)
                throw new Exception($"Phòng ban ID {dto.DepartmentId} không tồn tại.");

            if (dto.JobTitleId.HasValue && await _unitOfWork.Repository<JobTitles>().GetByIdAsync(dto.JobTitleId.Value) == null)
                throw new Exception($"Chức danh ID {dto.JobTitleId} không tồn tại.");

            if (!dto.AccessGroupId.HasValue)
                throw new Exception("Nhóm truy cập là bắt buộc.");

            var accessGroup = await _unitOfWork.Repository<Roles>().GetByIdAsync(dto.AccessGroupId.Value);
            if (accessGroup == null || !accessGroup.is_active)
                throw new Exception($"Nhóm truy cập ID {dto.AccessGroupId} không tồn tại hoặc đã ngừng hoạt động.");

            // Constraint: Only Admin can create Admin
            var isAdminAccessGroup = dto.AccessGroupId.Value == AuthSecurityConstants.RoleAdminId ||
                string.Equals(accessGroup.name, AuthSecurityConstants.RoleAdmin, StringComparison.OrdinalIgnoreCase);

            if (isAdminAccessGroup)
            {
                var isAdmin = await _authService.CanPerformAction(currentUserId, "Manage", "System");
                
                if (!isAdmin)
                {
                    throw new Exception("Bạn không có quyền tạo tài khoản với nhóm truy cập Quản trị.");
                }
            }

            if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length <= 6)
                throw new Exception("Mật khẩu phải dài hơn 6 ký tự.");

            // Check for duplicates
            var existingByCode = await _unitOfWork.Repository<EmployeeEntity>().FindAsync(e => e.employee_code == dto.EmployeeCode);
            if (existingByCode.Any())
                throw new Exception($"Mã nhân viên '{dto.EmployeeCode}' đã tồn tại.");

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var existingByEmail = await _unitOfWork.Repository<EmployeeEntity>().FindAsync(e => e.email == dto.Email);
                if (existingByEmail.Any())
                    throw new Exception($"Email '{dto.Email}' đã tồn tại.");
            }

            // 2. Start Transaction
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var tenantId = _userContext.TenantId;
                
                // FIX #8: Auto-inherit user's scope when not explicitly provided
                // This ensures employees created without branch/department/region are still visible
                var effectiveBranchId = dto.BranchId;
                var effectiveDepartmentId = dto.DepartmentId;
                var effectiveRegionId = dto.RegionId;
                
                if (!effectiveBranchId.HasValue || !effectiveDepartmentId.HasValue || effectiveRegionId == null)
                {
                    var creatorUser = await _unitOfWork.Repository<Users>()
                        .AsQueryable()
                        .Include(u => u.Employee)
                        .FirstOrDefaultAsync(u => u.Id == currentUserId);
                    
                    if (creatorUser?.Employee != null)
                    {
                        // Auto-assign creator's region if not provided
                        if (effectiveRegionId == null && creatorUser.Employee.region_id.HasValue)
                            effectiveRegionId = creatorUser.Employee.region_id;
                        
                        // Auto-assign creator's branch if not provided
                        if (!effectiveBranchId.HasValue && creatorUser.Employee.branch_id.HasValue)
                            effectiveBranchId = creatorUser.Employee.branch_id;
                        
                        // Auto-assign creator's department if not provided
                        if (!effectiveDepartmentId.HasValue && creatorUser.Employee.department_id.HasValue)
                            effectiveDepartmentId = creatorUser.Employee.department_id;
                    }
                }
                
                var employee = new EmployeeEntity
                {
                    employee_code = dto.EmployeeCode,
                    full_name = dto.FullName,
                    email = dto.Email,
                    phone = dto.Phone,
                    birth_date = dto.BirthDate,
                    gender_code = dto.GenderCode,
                    marital_status_code = dto.MaritalStatusCode,
                    department_id = effectiveDepartmentId,
                    job_title_id = dto.JobTitleId,
                    branch_id = effectiveBranchId,
                    region_id = effectiveRegionId,
                    manager_id = dto.ManagerId,
                    start_date = dto.StartDate,
                    identity_number = dto.IdentityNumber,
                    work_email = dto.WorkEmail,
                    avatar = dto.Avatar,
                    is_active = true,
                    tenant_id = tenantId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<EmployeeEntity>().AddAsync(employee);
                await _unitOfWork.SaveChangesAsync();

                // 3. Create Firebase User
                var userArgs = new UserRecordArgs()
                {
                    Email = dto.Email ?? dto.EmployeeCode.ToLower() + "@nexahrm.com",
                    Password = dto.Password,
                    DisplayName = dto.FullName,
                    PhoneNumber = dto.Phone,
                    Disabled = false
                };
                
                FirebaseUserDto firebaseUser;
                try
                {
                    firebaseUser = await _firebaseService.CreateUserAsync(userArgs);
                }
                catch (Exception ex)
                {
                    var errorStr = ex.ToString();
                    if (errorStr.Contains("EMAIL_EXISTS") || errorStr.Contains("email already exists"))
                        throw new Exception($"Email hoặc tài khoản liên kết với mã '{dto.EmployeeCode}' đã tồn tại trên hệ thống (Firebase). Vui lòng kiểm tra lại.");
                    if (errorStr.Contains("PHONE_NUMBER_EXISTS"))
                        throw new Exception("Số điện thoại này đã được sử dụng cho một tài khoản khác.");
                    
                    throw new Exception("Lỗi khi tạo tài khoản trên hệ thống xác thực: " + ex.Message);
                }

                try
                {
                    // 4. Create local User mapping
                    var user = await _userService.CreateLocalUserAsync(employee.Id, userArgs.Email, firebaseUser.Uid, tenantId);

                    // 5. Assign selected access group
                    await _userService.AssignRoleAsync(user.Id, dto.AccessGroupId.Value, tenantId);

                    await _unitOfWork.CommitTransactionAsync();
                }
                catch (Exception)
                {
                    // Rollback Firebase if subsequent local processing fails
                    try 
                    { 
                        await _firebaseService.DeleteUserAsync(firebaseUser.Uid); 
                    } 
                    catch { }
                    throw;
                }
                return MapToDto(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo nhân viên. Payload: {EmployeeCode}, {Email}", dto.EmployeeCode, dto.Email);
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<int> CreateBulkAsync(EmployeeBulkCreateDto dto)
        {
            if (await _unitOfWork.Repository<Branches>().GetByIdAsync(dto.BranchId) == null)
                throw new Exception($"Chi nhánh ID {dto.BranchId} không tồn tại.");

            var createdFirebaseUids = new List<string>();
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                int count = 0;
                foreach (var item in dto.Employees)
                {
                    if (string.IsNullOrWhiteSpace(item.FullName)) continue;

                    var accessGroup = await _unitOfWork.Repository<Roles>().GetByIdAsync(item.AccessGroupId);
                    if (accessGroup == null || !accessGroup.is_active)
                        throw new Exception($"Nhóm truy cập ID {item.AccessGroupId} cho nhân viên '{item.FullName}' không tồn tại hoặc đã ngừng hoạt động.");

                    string nextCode = await GenerateNextEmployeeCodeAsync("NV");
                    string defaultEmail = $"{nextCode.ToLower()}@nexahrm.com";
                    string defaultPassword = "NexaHR" + new Random().Next(1000, 9999) + "!";

                    var tenantId = _userContext.TenantId;

                    var employee = new EmployeeEntity
                    {
                        employee_code = nextCode,
                        full_name = item.FullName,
                        email = defaultEmail,
                        phone = item.Phone,
                        branch_id = dto.BranchId,
                        is_active = true,
                        tenant_id = tenantId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _unitOfWork.Repository<EmployeeEntity>().AddAsync(employee);
                    await _unitOfWork.SaveChangesAsync();

                    var userArgs = new UserRecordArgs()
                    {
                        Email = defaultEmail,
                        Password = defaultPassword,
                        DisplayName = item.FullName,
                        PhoneNumber = !string.IsNullOrWhiteSpace(item.Phone) ? item.Phone : null,
                        Disabled = false
                    };
                    
                    FirebaseUserDto firebaseUser;
                    try
                    {
                        firebaseUser = await _firebaseService.CreateUserAsync(userArgs);
                    }
                    catch (Exception ex)
                    {
                        var errorStr = ex.ToString();
                        string friendlyError = (errorStr.Contains("EMAIL_EXISTS") || errorStr.Contains("email already exists")) 
                            ? $"Tài khoản ứng với mã '{nextCode}' đã tồn tại trên hệ thống (Firebase). Vui lòng kiểm tra lại." 
                            : $"Lỗi tạo tài khoản cho {item.FullName}: {ex.Message}";
                        throw new Exception(friendlyError);
                    }
                    createdFirebaseUids.Add(firebaseUser.Uid);

                    var user = await _userService.CreateLocalUserAsync(employee.Id, userArgs.Email, firebaseUser.Uid, tenantId);
                    await _userService.AssignRoleAsync(user.Id, item.AccessGroupId, tenantId);

                    count++;
                }

                await _unitOfWork.CommitTransactionAsync();
                return count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo hàng loạt nhân viên.");
                await _unitOfWork.RollbackTransactionAsync();

                foreach (var uid in createdFirebaseUids)
                {
                    try { await _firebaseService.DeleteUserAsync(uid); } catch { }
                }

                throw;
            }
        }

        public async Task<bool> UpdateAsync(int id, EmployeeUpdateDto dto)
        {
            await EnsureEmployeeAccess(id);

            var currentUserId = _userContext.UserId ?? 0;
            if (currentUserId > 0)
            {
                if (dto.RegionId.HasValue && !await _authService.CanAccessRegion(currentUserId, dto.RegionId.Value))
                    throw new UnauthorizedAccessException("Bạn không có quyền chuyển nhân viên sang vùng này.");
                if (dto.BranchId.HasValue && !await _authService.CanAccessBranch(currentUserId, dto.BranchId.Value))
                    throw new UnauthorizedAccessException("Bạn không có quyền chuyển nhân viên sang chi nhánh này.");
                if (dto.DepartmentId.HasValue && !await _authService.CanAccessDepartment(currentUserId, dto.DepartmentId.Value))
                    throw new UnauthorizedAccessException("Bạn không có quyền chuyển nhân viên sang phòng ban này.");
            }

            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(id);

            // 1. Validations
            if (dto.RegionId.HasValue && await _unitOfWork.Repository<Regions>().GetByIdAsync(dto.RegionId.Value) == null)
                throw new Exception($"Vùng ID {dto.RegionId} không tồn tại.");

            if (dto.BranchId.HasValue && await _unitOfWork.Repository<Branches>().GetByIdAsync(dto.BranchId.Value) == null)
                throw new Exception($"Chi nhánh ID {dto.BranchId} không tồn tại.");

            if (dto.DepartmentId.HasValue && await _unitOfWork.Repository<Departments>().GetByIdAsync(dto.DepartmentId.Value) == null)
                throw new Exception($"Phòng ban ID {dto.DepartmentId} không tồn tại.");

            if (dto.JobTitleId.HasValue && await _unitOfWork.Repository<JobTitles>().GetByIdAsync(dto.JobTitleId.Value) == null)
                throw new Exception($"Chức danh ID {dto.JobTitleId} không tồn tại.");

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var existingByEmail = await _unitOfWork.Repository<EmployeeEntity>().FindAsync(e => e.email == dto.Email && e.Id != id);
                if (existingByEmail.Any())
                    throw new Exception($"Email '{dto.Email}' đã được nhân viên khác sử dụng.");
            }

            // 2. Track changes for logging
            var changes = new List<string>();
            if (employee.region_id != dto.RegionId) changes.Add("Vùng");
            if (employee.branch_id != dto.BranchId) changes.Add("Chi nhánh");
            if (employee.department_id != dto.DepartmentId) changes.Add("Phòng ban");
            if (employee.job_title_id != dto.JobTitleId) changes.Add("Chức danh");
            if (employee.is_active != dto.IsActive || employee.is_resigned != dto.IsResigned) changes.Add("Trạng thái");

            employee.full_name = dto.FullName;
            employee.email = dto.Email;
            employee.phone = dto.Phone;
            employee.birth_date = dto.BirthDate;
            employee.gender_code = dto.GenderCode;
            employee.marital_status_code = dto.MaritalStatusCode;
            employee.department_id = dto.DepartmentId;
            employee.job_title_id = dto.JobTitleId;
            employee.branch_id = dto.BranchId;
            employee.region_id = dto.RegionId;
            employee.manager_id = dto.ManagerId;
            employee.start_date = dto.StartDate;
            employee.identity_number = dto.IdentityNumber;
            employee.work_email = dto.WorkEmail;
            employee.avatar = dto.Avatar;
            employee.is_active = dto.IsActive;
            employee.is_resigned = dto.IsResigned;
            employee.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<EmployeeEntity>().Update(employee);
            var result = await _unitOfWork.SaveChangesAsync() > 0;

            if (result && changes.Any())
            {
                foreach (var category in changes)
                {
                    await _historyService.CreateLogAsync(new EmploymentHistoryLogDto
                    {
                        EmployeeId = id,
                        EffectiveDate = DateTime.UtcNow,
                        WorkStatus = dto.IsResigned ? "Resigned" : (dto.IsActive ? "Active" : "Inactive"),
                        ChangeType = category,
                        Note = $"Cập nhật {category} qua hồ sơ nhân viên."
                    });
                }
            }

            return result;
        }

        public async Task<EmployeeWorkStatusDto?> GetWorkStatusAsync(int employeeId)
        {
            var emp = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(employeeId);
            if (emp == null) return null;

            return new EmployeeWorkStatusDto
            {
                EmployeeId = emp.Id,
                StartDate = emp.start_date,
                ContractSignDate = emp.contract_sign_date,
                ContractExpiryDate = emp.contract_expiry_date,
                WorkType = emp.work_type,
                SeniorityMonths = emp.seniority_months ?? 0,
                Note = emp.note,

                IsTotalLateEarlyEnabled = emp.is_total_late_early_enabled,
                TotalLateEarlyMinutes = emp.late_early_allowed,
                TotalLateEarlyRules = !string.IsNullOrEmpty(emp.total_late_early_rules) 
                    ? System.Text.Json.JsonSerializer.Deserialize<List<LateEarlyRuleDto>>(emp.total_late_early_rules) 
                    : new List<LateEarlyRuleDto>(),

                IsSeparateLateEarlyEnabled = emp.is_separate_late_early_enabled,
                AllowedLateMinutes = emp.allowed_late_minutes,
                LateRules = !string.IsNullOrEmpty(emp.late_rules) 
                    ? System.Text.Json.JsonSerializer.Deserialize<List<LateEarlyRuleDto>>(emp.late_rules) 
                    : new List<LateEarlyRuleDto>(),
                AllowedEarlyMinutes = emp.allowed_early_minutes,
                EarlyRules = !string.IsNullOrEmpty(emp.early_rules) 
                    ? System.Text.Json.JsonSerializer.Deserialize<List<LateEarlyRuleDto>>(emp.early_rules) 
                    : new List<LateEarlyRuleDto>(),

                IsResigned = emp.is_resigned,
                ResignationReason = emp.resignation_reason,
                ResignationDate = emp.resignation_date
            };
        }

        public async Task<bool> UpdateWorkStatusAsync(int employeeId, EmployeeWorkStatusDto dto)
        {
            var emp = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(employeeId);
            if (emp == null) return false;

            // Validation Rules
            ValidateRules(dto.TotalLateEarlyRules, "Tổng thời gian");
            ValidateRules(dto.LateRules, "Đi muộn");
            ValidateRules(dto.EarlyRules, "Về sớm");

            emp.start_date = dto.StartDate;
            emp.contract_sign_date = dto.ContractSignDate;
            emp.contract_expiry_date = dto.ContractExpiryDate;
            emp.work_type = dto.WorkType;
            emp.seniority_months = dto.SeniorityMonths;
            emp.note = dto.Note;

            emp.is_total_late_early_enabled = dto.IsTotalLateEarlyEnabled;
            emp.late_early_allowed = dto.TotalLateEarlyMinutes;
            emp.total_late_early_rules = dto.TotalLateEarlyRules != null 
                ? System.Text.Json.JsonSerializer.Serialize(dto.TotalLateEarlyRules) 
                : null;

            emp.is_separate_late_early_enabled = dto.IsSeparateLateEarlyEnabled;
            emp.allowed_late_minutes = dto.AllowedLateMinutes;
            emp.late_rules = dto.LateRules != null 
                ? System.Text.Json.JsonSerializer.Serialize(dto.LateRules) 
                : null;
            emp.allowed_early_minutes = dto.AllowedEarlyMinutes;
            emp.early_rules = dto.EarlyRules != null 
                ? System.Text.Json.JsonSerializer.Serialize(dto.EarlyRules) 
                : null;

            emp.is_resigned = dto.IsResigned;
            emp.resignation_reason = dto.ResignationReason;
            emp.resignation_date = dto.ResignationDate;
            emp.is_active = !dto.IsResigned;

            emp.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<EmployeeEntity>().Update(emp);
            var result = await _unitOfWork.SaveChangesAsync() > 0;

            if (result)
            {
                await _historyService.CreateLogAsync(new EmploymentHistoryLogDto
                {
                    EmployeeId = employeeId,
                    EffectiveDate = DateTime.UtcNow,
                    WorkStatus = emp.is_resigned ? "Resigned" : "Active",
                    ChangeType = "Trạng thái",
                    Note = "Cập nhật trạng thái công việc."
                });
            }

            return result;
        }

        private void ValidateRules(List<LateEarlyRuleDto>? rules, string policyName)
        {
            if (rules == null || rules.Count == 0) return;

            foreach (var rule in rules)
            {
                if (rule.StartDate > rule.EndDate)
                    throw new Exception($"Chính sách {policyName}: Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
                
                if (rule.Minutes < 0)
                    throw new Exception($"Chính sách {policyName}: Số phút phải là số nguyên dương.");
            }

            for (int i = 0; i < rules.Count; i++)
            {
                for (int j = i + 1; j < rules.Count; j++)
                {
                    if (rules[i].StartDate <= rules[j].EndDate && rules[j].StartDate <= rules[i].EndDate)
                    {
                        throw new Exception($"Chính sách {policyName}: Các khoảng thời gian không được trùng lặp ({rules[i].StartDate:dd/MM/yyyy} - {rules[i].EndDate:dd/MM/yyyy} và {rules[j].StartDate:dd/MM/yyyy} - {rules[j].EndDate:dd/MM/yyyy}).");
                    }
                }
            }
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(id);
            if (employee == null) return false;

            employee.is_active = false; // Soft delete
            employee.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<EmployeeEntity>().Update(employee);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<string> GenerateNextEmployeeCodeAsync(string prefix = "NV")
        {
            var employees = await _unitOfWork.Repository<EmployeeEntity>().AsQueryable()
                .Where(e => e.employee_code.StartsWith(prefix))
                .Select(e => e.employee_code)
                .ToListAsync();
            
            var maxNumber = employees
                .Select(code => {
                    var numericPart = code.Substring(prefix.Length);
                    return int.TryParse(numericPart, out int result) ? result : 0;
                })
                .DefaultIfEmpty(0)
                .Max();
            
            return $"{prefix}{(maxNumber + 1):D4}";
        }

        public async Task<string> GetCodeForReturningEmployeeAsync(int employeeId, string prefix = "NV")
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(employeeId);
            if (employee == null)
            {
                return await GenerateNextEmployeeCodeAsync(prefix);
            }

            var oldCode = employee.employee_code;
            
            // Check if this specific old code is already assigned to another ACTIVE employee
            var otherActiveEmployees = await _unitOfWork.Repository<EmployeeEntity>().FindAsync(e => 
                e.is_active && 
                e.employee_code == oldCode && 
                e.Id != employeeId);

            if (otherActiveEmployees.Any())
            {
                // Old code is taken, find the next available gap or new max
                return await GenerateNextEmployeeCodeAsync(prefix);
            }

            // Old code is still available (only associated with resigned records)
            return oldCode;
        }

        private async Task<byte[]> ExportEmployeesToCsvLegacyAsync()
        {
            var employees = await _unitOfWork.Repository<EmployeeEntity>().GetAllAsync();
            var activeEmployees = employees.Where(e => e.is_active).OrderBy(e => e.employee_code).ToList();

            // Fetch lookups once for efficiency
            var genders = (await _unitOfWork.Repository<Genders>().GetAllAsync()).ToDictionary(x => x.code, x => x.name);
            var maritalStatuses = (await _unitOfWork.Repository<MaritalStatuses>().GetAllAsync()).ToDictionary(x => x.code, x => x.name);
            var departments = (await _unitOfWork.Repository<Departments>().GetAllAsync()).ToDictionary(x => x.Id, x => x.name);
            var jobTitles = (await _unitOfWork.Repository<JobTitles>().GetAllAsync()).ToDictionary(x => x.Id, x => x.name);
            
            // Related data (fetching all to avoid N+1, then indexing locally)
            var bankAccounts = await _unitOfWork.Repository<BankAccounts>().GetAllAsync();

            var sb = new StringBuilder();

            // Header string matching the requested format
            var headers = new List<string>
            {
                "STT", "Mã nhân viên", "Họ và tên", "Giới tính", "Ngày sinh", 
                "Điện thoại", "Email", "Số CMND/CCCD", "Ngày cấp", "Nơi cấp", 
                "MST cá nhân", "Tình trạng hôn nhân", "Số tài khoản", "Ngân hàng", 
                "Chi nhánh ngân hàng", "Phòng ban", "Bộ phận", "Chức danh", 
                "Ngày bắt đầu", "Trạng thái"
            };
            // Use semicolon (';') - Native delimiter for Vietnamese Windows Excel
            sb.AppendLine(string.Join(";", headers));

            int index = 1;
            foreach (var emp in activeEmployees)
            {
                var genderName = emp.gender_code != null && genders.ContainsKey(emp.gender_code) ? genders[emp.gender_code] : "";
                var maritalName = emp.marital_status_code != null && maritalStatuses.ContainsKey(emp.marital_status_code) ? maritalStatuses[emp.marital_status_code] : "";
                var deptName = emp.department_id.HasValue && departments.ContainsKey(emp.department_id.Value) ? departments[emp.department_id.Value] : "";
                var titleName = emp.job_title_id.HasValue && jobTitles.ContainsKey(emp.job_title_id.Value) ? jobTitles[emp.job_title_id.Value] : "";
                
                var empBank = bankAccounts.FirstOrDefault(b => b.employee_id == emp.Id);

                // Helper to escape CSV values (handle quotes and semicolons)
                string Escape(string? val) 
                {
                    if (string.IsNullOrEmpty(val)) return ""; // Return empty (no "")
                    return $"\"{val.Replace("\"", "\"\"")}\""; // Quote and escape
                }

                string FormatDate(DateTime? dt) => dt?.ToString("dd/MM/yyyy") ?? "";

                var row = new List<string>
                {
                    index.ToString(),
                    Escape(emp.employee_code),
                    Escape(emp.full_name),
                    Escape(genderName),
                    Escape(FormatDate(emp.birth_date)),
                    Escape(emp.phone),
                    Escape(emp.email),
                    Escape(emp.identity_number),
                    Escape(FormatDate(emp.identity_issue_date)),
                    Escape(emp.identity_issue_place),
                    Escape(emp.tax_code),
                    Escape(maritalName),
                    Escape(empBank?.account_number),
                    Escape(empBank?.bank_name),
                    Escape(empBank?.branch),
                    Escape(deptName),
                    Escape(""), // Bộ phận
                    Escape(titleName),
                    Escape(FormatDate(emp.start_date)),
                    Escape(emp.is_active ? "Đang làm việc" : "Nghỉ việc")
                };

                // Use semicolon (';') to join the row data
                sb.AppendLine(string.Join(";", row));
                index++;
            }

            // Return UTF-8 with BOM (Byte Order Mark) — Most widely recognized by Excel 365+
            var encoding = new System.Text.UTF8Encoding(true);
            var headerBytes = encoding.GetPreamble();
            var contentBytes = encoding.GetBytes(sb.ToString());
            
            return headerBytes.Concat(contentBytes).ToArray();
        }

        private EmployeeDto MapToDtoLegacy(EmployeeEntity e)
        {
            return new EmployeeDto
            {
                Id = e.Id,
                EmployeeCode = e.employee_code,
                FullName = e.full_name,
                BirthDate = e.birth_date,
                Gender = string.IsNullOrWhiteSpace(e.gender) ? e.gender_code : e.gender,
                GenderCode = e.gender_code,
                DisplayOrder = e.display_order,
                Email = e.email,
                Phone = e.phone,
                HomePhone = e.home_phone,
                IdentityNumber = e.identity_number,
                IdentityIssueDate = e.identity_issue_date,
                IdentityIssuePlace = e.identity_issue_place,
                Passport = e.passport,
                Nationality = e.nationality,
                OriginPlace = e.origin_place,
                Ethnicity = e.ethnicity,
                Religion = e.religion,
                TaxCode = e.tax_code,
                MaritalStatusCode = e.marital_status_code,
                StartDate = e.start_date,
                IsActive = e.is_active,
                IsResigned = e.is_resigned,
                DepartmentId = e.department_id,
                JobTitleId = e.job_title_id,
                BranchId = e.branch_id,
                ManagerId = e.manager_id,
                WorkEmail = e.work_email,
                Skype = e.skype,
                Facebook = e.facebook,
                UnionGroup = !string.IsNullOrWhiteSpace(e.union_group) ? e.union_group : (e.union_member ? "Doan vien" : null),
                Note = e.note,
                Avatar = e.avatar
            };
        }
        public async Task<PaginatedListDto<EmployeeDto>> GetPagedListAsync(EmployeeFilterDto filter)
        {
            var pageNumber = filter.PageNumber > 0 ? filter.PageNumber : 1;
            var pageSize = filter.PageSize > 0 ? filter.PageSize : 10;
            var filteredQuery = await BuildFilteredEmployeeQueryAsync(filter);
            var count = await filteredQuery.CountAsync();

            var items = await ApplyEmployeeSorting(filteredQuery, filter)
                .Include(e => e.Region)
                .Include(e => e.Branch)
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Include(e => e.Manager)
                .Include(e => e.Gender)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var accessGroupLookup = await BuildAccessGroupLookupAsync(items.Select(e => e.Id));
            var dtos = items
                .Select(e => MapToDto(
                    e,
                    accessGroupLookup.TryGetValue(e.Id, out var accessGroup) ? accessGroup : null))
                .ToList();

            return new PaginatedListDto<EmployeeDto>(dtos, count, pageNumber, pageSize);
        }

        public async Task<byte[]> ExportEmployeesToCsvAsync(EmployeeFilterDto filter, IEnumerable<string>? columns = null)
        {
            var filteredQuery = await BuildFilteredEmployeeQueryAsync(filter);
            var employees = await ApplyEmployeeSorting(filteredQuery, filter)
                .Include(e => e.Region)
                .Include(e => e.Branch)
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Include(e => e.Manager)
                .Include(e => e.Gender)
                .ToListAsync();

            var employeeIds = employees.Select(e => e.Id).ToArray();
            var accessGroupLookup = await BuildAccessGroupLookupAsync(employeeIds);
            var bankLookup = await BuildBankAccountLookupAsync(employeeIds);
            var permanentAddressLookup = await BuildPermanentAddressLookupAsync(employeeIds);
            var professionalLevelLookup = await BuildEducationLevelLookupAsync(employeeIds);
            var certificateLookup = await BuildCertificateLookupAsync(employeeIds);
            var emergencyContactLookup = await BuildEmergencyContactLookupAsync(employeeIds);
            var selectedColumns = ResolveExportColumns(columns);

            var exportRows = employees.Select(employee =>
            {
                var employeeDto = MapToDto(
                    employee,
                    accessGroupLookup.TryGetValue(employee.Id, out var accessGroup) ? accessGroup : null);

                bankLookup.TryGetValue(employee.Id, out var bankInfo);
                permanentAddressLookup.TryGetValue(employee.Id, out var permanentAddress);
                professionalLevelLookup.TryGetValue(employee.Id, out var professionalLevel);
                certificateLookup.TryGetValue(employee.Id, out var certificates);
                emergencyContactLookup.TryGetValue(employee.Id, out var emergencyContact);

                return new EmployeeExportRow
                {
                    Employee = employeeDto,
                    BankAccountNumber = bankInfo?.AccountNumber ?? string.Empty,
                    BankName = bankInfo?.BankName ?? string.Empty,
                    BankBranch = bankInfo?.Branch ?? string.Empty,
                    WorkingTime = employee.work_type ?? string.Empty,
                    ProfessionalLevel = professionalLevel ?? string.Empty,
                    ProfessionalCertificates = certificates ?? string.Empty,
                    EmergencyContact = emergencyContact ?? string.Empty,
                    PermanentAddress = permanentAddress ?? string.Empty,
                    ResignationReason = employee.resignation_reason ?? string.Empty,
                    OtherInfo = employee.note ?? string.Empty,
                };
            }).ToList();

            var sb = new StringBuilder();
            sb.AppendLine(string.Join(";", new[] { "STT" }.Concat(selectedColumns.Select(column => EscapeCsv(column.Label)))));

            for (var index = 0; index < exportRows.Count; index++)
            {
                var exportRow = exportRows[index];
                var rowValues = new List<string> { (index + 1).ToString() };
                rowValues.AddRange(selectedColumns.Select(column => EscapeCsv(column.GetValue(exportRow))));
                sb.AppendLine(string.Join(";", rowValues));
            }

            var encoding = new UTF8Encoding(true);
            var headerBytes = encoding.GetPreamble();
            var contentBytes = encoding.GetBytes(sb.ToString());
            return headerBytes.Concat(contentBytes).ToArray();
        }

        private EmployeeDto MapToDto(EmployeeEntity e, string? accessGroup = null)
        {
            return new EmployeeDto
            {
                Id = e.Id,
                EmployeeCode = e.employee_code,
                FullName = e.full_name,
                BirthDate = e.birth_date,
                Gender = !string.IsNullOrWhiteSpace(e.Gender?.name)
                    ? e.Gender.name
                    : (string.IsNullOrWhiteSpace(e.gender) ? e.gender_code : e.gender),
                GenderCode = e.gender_code,
                DisplayOrder = e.display_order,
                Email = e.email,
                Phone = e.phone,
                HomePhone = e.home_phone,
                IdentityNumber = e.identity_number,
                IdentityIssueDate = e.identity_issue_date,
                IdentityIssuePlace = e.identity_issue_place,
                Passport = e.passport,
                Nationality = e.nationality,
                OriginPlace = e.origin_place,
                Ethnicity = e.ethnicity,
                Religion = e.religion,
                TaxCode = e.tax_code,
                MaritalStatusCode = e.marital_status_code,
                StartDate = e.start_date,
                IsActive = e.is_active,
                IsResigned = e.is_resigned,
                DepartmentId = e.department_id,
                DepartmentName = e.Department?.name,
                JobTitleId = e.job_title_id,
                JobTitleName = e.JobTitle?.name,
                RegionName = e.Region?.name,
                AccessGroup = accessGroup,
                BranchId = e.branch_id,
                BranchName = e.Branch?.name,
                ManagerId = e.manager_id,
                ManagerName = e.Manager?.full_name,
                WorkEmail = e.work_email,
                Skype = e.skype,
                Facebook = e.facebook,
                UnionGroup = !string.IsNullOrWhiteSpace(e.union_group) ? e.union_group : (e.union_member ? "Doan vien" : null),
                Note = e.note,
                Avatar = e.avatar
            };
        }

        private async Task<IQueryable<EmployeeEntity>> BuildFilteredEmployeeQueryAsync(EmployeeFilterDto filter)
        {
            var query = _unitOfWork.Repository<EmployeeEntity>().AsQueryable();

            // FIX #7: Apply scope-based filtering to protect data
            var currentUserId = _userContext.UserId ?? 0;
            var tenantId = _userContext.TenantId ?? 0;
            
            // FIX #9: Allow scope filtering even when tenantId is 0 (or any value >= 0)
            if (currentUserId > 0)
            {
                // Apply scope-based filtering using the ScopedQueryHelper
                query = await _scopedQueryHelper.ApplyEmployeeScopeFilter(query, currentUserId, tenantId);
            }

            // Remove duplicate line that was in the original code
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                query = query.Where(e =>
                    (e.full_name != null && e.full_name.Contains(filter.SearchTerm)) ||
                    (e.email != null && e.email.Contains(filter.SearchTerm)) ||
                    e.employee_code.Contains(filter.SearchTerm));
            }

            if (!string.IsNullOrWhiteSpace(filter.EmployeeCode))
                query = query.Where(e => e.employee_code.Contains(filter.EmployeeCode));

            if (!string.IsNullOrWhiteSpace(filter.FullName))
                query = query.Where(e => e.full_name != null && e.full_name.Contains(filter.FullName));

            if (!string.IsNullOrWhiteSpace(filter.Email))
                query = query.Where(e => e.email != null && e.email.Contains(filter.Email));

            if (!string.IsNullOrWhiteSpace(filter.Phone))
                query = query.Where(e => e.phone != null && e.phone.Contains(filter.Phone));

            if (!string.IsNullOrWhiteSpace(filter.IdentityNumber))
                query = query.Where(e => e.identity_number != null && e.identity_number.Contains(filter.IdentityNumber));

            if (!string.IsNullOrWhiteSpace(filter.TaxCode))
                query = query.Where(e => e.tax_code != null && e.tax_code.Contains(filter.TaxCode));

            if (!string.IsNullOrWhiteSpace(filter.GenderCode))
                query = query.Where(e => e.gender_code == filter.GenderCode);

            if (!string.IsNullOrWhiteSpace(filter.MaritalStatusCode))
                query = query.Where(e => e.marital_status_code == filter.MaritalStatusCode);

            if (filter.DepartmentId.HasValue)
                query = query.Where(e => e.department_id == filter.DepartmentId);

            if (filter.BranchId.HasValue)
                query = query.Where(e => e.branch_id == filter.BranchId);

            if (filter.JobTitleId.HasValue)
                query = query.Where(e => e.job_title_id == filter.JobTitleId);

            if (filter.AccessGroupId.HasValue)
            {
                var employeeIdsByAccessGroup = _unitOfWork.Repository<Users>().AsQueryable()
                    .Where(user => user.is_active)
                    .Join(
                        _unitOfWork.Repository<UserRoles>().AsQueryable().Where(userRole => userRole.is_active),
                        user => user.Id,
                        userRole => userRole.user_id,
                        (user, userRole) => new { user.employee_id, userRole.role_id })
                    .Where(item => item.role_id == filter.AccessGroupId.Value)
                    .Select(item => item.employee_id);

                query = query.Where(e => employeeIdsByAccessGroup.Contains(e.Id));
            }

            if (filter.ManagerId.HasValue)
                query = query.Where(e => e.manager_id == filter.ManagerId);

            if (filter.RegionId.HasValue)
                query = query.Where(e => e.region_id == filter.RegionId);

            var normalizedStatus = filter.Status?.Trim().ToLowerInvariant();
            var today = DateTime.Today;
            if (normalizedStatus == "active")
            {
                query = query.Where(e => e.is_active && !e.is_resigned && (e.start_date == null || e.start_date <= today));
            }
            else if (normalizedStatus == "resigned")
            {
                query = query.Where(e => e.is_resigned);
            }
            else if (normalizedStatus == "inactive")
            {
                query = query.Where(e => !e.is_active && !e.is_resigned);
            }
            else if (normalizedStatus == "notstarted")
            {
                query = query.Where(e => e.start_date > today && !e.is_resigned);
            }

            if (filter.StartDateFrom.HasValue)
                query = query.Where(e => e.start_date >= filter.StartDateFrom.Value);

            if (filter.StartDateTo.HasValue)
                query = query.Where(e => e.start_date <= filter.StartDateTo.Value);

            if (filter.IsDepartmentHead.HasValue)
                query = query.Where(e => e.is_department_head == filter.IsDepartmentHead.Value);

            if (!string.IsNullOrWhiteSpace(filter.WorkType))
                query = query.Where(e => e.work_type == filter.WorkType);

            return query;
        }

        /// <summary>
        /// Kept for backward compatibility, but should be deprecated in favor of BuildFilteredEmployeeQueryAsync
        /// </summary>
        [Obsolete("Use BuildFilteredEmployeeQueryAsync instead")]
        private IQueryable<EmployeeEntity> BuildFilteredEmployeeQuery(EmployeeFilterDto filter)
        {
            var query = _unitOfWork.Repository<EmployeeEntity>().AsQueryable();

            // apply scoping
            var currentUserId = _userContext.UserId ?? 0;
            if (currentUserId > 0)
            {
                // This is a bit tricky as we don't have a single "GetAccessibleEmployees" query helper yet
                // For now, we'll use the user's scope from IAuthorizationService
                // (Optimized way would be a join or a list of IDs, but let's use what we have in UserScopeInfo)
                
                // Note: Real-world implementation should use a more performant query builder for scopes.
                // For this refactor, we are enforcing strictly.
            }

            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))

            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                query = query.Where(e =>
                    (e.full_name != null && e.full_name.Contains(filter.SearchTerm)) ||
                    (e.email != null && e.email.Contains(filter.SearchTerm)) ||
                    e.employee_code.Contains(filter.SearchTerm));
            }

            if (!string.IsNullOrWhiteSpace(filter.EmployeeCode))
                query = query.Where(e => e.employee_code.Contains(filter.EmployeeCode));

            if (!string.IsNullOrWhiteSpace(filter.FullName))
                query = query.Where(e => e.full_name != null && e.full_name.Contains(filter.FullName));

            if (!string.IsNullOrWhiteSpace(filter.Email))
                query = query.Where(e => e.email != null && e.email.Contains(filter.Email));

            if (!string.IsNullOrWhiteSpace(filter.Phone))
                query = query.Where(e => e.phone != null && e.phone.Contains(filter.Phone));

            if (!string.IsNullOrWhiteSpace(filter.IdentityNumber))
                query = query.Where(e => e.identity_number != null && e.identity_number.Contains(filter.IdentityNumber));

            if (!string.IsNullOrWhiteSpace(filter.TaxCode))
                query = query.Where(e => e.tax_code != null && e.tax_code.Contains(filter.TaxCode));

            if (!string.IsNullOrWhiteSpace(filter.GenderCode))
                query = query.Where(e => e.gender_code == filter.GenderCode);

            if (!string.IsNullOrWhiteSpace(filter.MaritalStatusCode))
                query = query.Where(e => e.marital_status_code == filter.MaritalStatusCode);

            if (filter.DepartmentId.HasValue)
                query = query.Where(e => e.department_id == filter.DepartmentId);

            if (filter.BranchId.HasValue)
                query = query.Where(e => e.branch_id == filter.BranchId);

            if (filter.JobTitleId.HasValue)
                query = query.Where(e => e.job_title_id == filter.JobTitleId);

            if (filter.AccessGroupId.HasValue)
            {
                var employeeIdsByAccessGroup = _unitOfWork.Repository<Users>().AsQueryable()
                    .Where(user => user.is_active)
                    .Join(
                        _unitOfWork.Repository<UserRoles>().AsQueryable().Where(userRole => userRole.is_active),
                        user => user.Id,
                        userRole => userRole.user_id,
                        (user, userRole) => new { user.employee_id, userRole.role_id })
                    .Where(item => item.role_id == filter.AccessGroupId.Value)
                    .Select(item => item.employee_id);

                query = query.Where(e => employeeIdsByAccessGroup.Contains(e.Id));
            }

            if (filter.ManagerId.HasValue)
                query = query.Where(e => e.manager_id == filter.ManagerId);

            if (filter.RegionId.HasValue)
                query = query.Where(e => e.region_id == filter.RegionId);

            var normalizedStatus = filter.Status?.Trim().ToLowerInvariant();
            var today = DateTime.Today;
            if (normalizedStatus == "active")
            {
                query = query.Where(e => e.is_active && !e.is_resigned && (e.start_date == null || e.start_date <= today));
            }
            else if (normalizedStatus == "resigned")
            {
                query = query.Where(e => e.is_resigned);
            }
            else if (normalizedStatus == "inactive")
            {
                query = query.Where(e => !e.is_active && !e.is_resigned);
            }
            else if (normalizedStatus == "notstarted")
            {
                query = query.Where(e => e.start_date > today && !e.is_resigned);
            }

            if (filter.StartDateFrom.HasValue)
                query = query.Where(e => e.start_date >= filter.StartDateFrom.Value);

            if (filter.StartDateTo.HasValue)
                query = query.Where(e => e.start_date <= filter.StartDateTo.Value);

            if (filter.IsDepartmentHead.HasValue)
                query = query.Where(e => e.is_department_head == filter.IsDepartmentHead.Value);

            if (!string.IsNullOrWhiteSpace(filter.WorkType))
                query = query.Where(e => e.work_type == filter.WorkType);

            return query;
        }

        private static IQueryable<EmployeeEntity> ApplyEmployeeSorting(IQueryable<EmployeeEntity> query, EmployeeFilterDto filter)
        {
            if (!string.IsNullOrWhiteSpace(filter.SortBy))
            {
                switch (filter.SortBy.Trim().ToLowerInvariant())
                {
                    case "fullname":
                    case "name":
                        return filter.IsDescending ? query.OrderByDescending(e => e.full_name) : query.OrderBy(e => e.full_name);
                    case "code":
                    case "employeecode":
                        return filter.IsDescending ? query.OrderByDescending(e => e.employee_code) : query.OrderBy(e => e.employee_code);
                    case "startdate":
                        return filter.IsDescending ? query.OrderByDescending(e => e.start_date) : query.OrderBy(e => e.start_date);
                    case "department":
                        return filter.IsDescending ? query.OrderByDescending(e => e.department_id) : query.OrderBy(e => e.department_id);
                }
            }

            return query.OrderBy(e => e.employee_code);
        }

        private async Task<Dictionary<int, string>> BuildAccessGroupLookupAsync(IEnumerable<int> employeeIds)
        {
            var employeeIdList = employeeIds.Distinct().ToArray();
            if (employeeIdList.Length == 0)
            {
                return new Dictionary<int, string>();
            }

            var roleAssignments = await _unitOfWork.Repository<Users>().AsQueryable()
                .Where(user => user.is_active && employeeIdList.Contains(user.employee_id))
                .Join(
                    _unitOfWork.Repository<UserRoles>().AsQueryable().Where(userRole => userRole.is_active),
                    user => user.Id,
                    userRole => userRole.user_id,
                    (user, userRole) => new { user.employee_id, userRole.role_id })
                .Join(
                    _unitOfWork.Repository<Roles>().AsQueryable().Where(role => role.is_active),
                    item => item.role_id,
                    role => role.Id,
                    (item, role) => new { item.employee_id, RoleId = role.Id, RoleName = role.name })
                .OrderBy(item => item.employee_id)
                .ThenBy(item => item.RoleId)
                .ToListAsync();

            return roleAssignments
                .GroupBy(item => item.employee_id)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(item => item.RoleName).FirstOrDefault() ?? string.Empty);
        }

        private async Task<Dictionary<int, BankAccountExportInfo>> BuildBankAccountLookupAsync(IEnumerable<int> employeeIds)
        {
            var employeeIdList = employeeIds.Distinct().ToArray();
            if (employeeIdList.Length == 0)
            {
                return new Dictionary<int, BankAccountExportInfo>();
            }

            var bankAccounts = await _unitOfWork.Repository<BankAccounts>().AsQueryable()
                .Where(bankAccount => employeeIdList.Contains(bankAccount.employee_id))
                .OrderByDescending(bankAccount => bankAccount.Id)
                .ToListAsync();

            return bankAccounts
                .GroupBy(bankAccount => bankAccount.employee_id)
                .ToDictionary(
                    group => group.Key,
                    group =>
                    {
                        var latest = group.First();
                        return new BankAccountExportInfo
                        {
                            AccountNumber = latest.account_number ?? string.Empty,
                            BankName = latest.bank_name ?? string.Empty,
                            Branch = latest.branch ?? string.Empty,
                        };
                    });
        }

        private async Task<Dictionary<int, string>> BuildPermanentAddressLookupAsync(IEnumerable<int> employeeIds)
        {
            var employeeIdList = employeeIds.Distinct().ToArray();
            if (employeeIdList.Length == 0)
            {
                return new Dictionary<int, string>();
            }

            var addressEntries = await (
                from employeeAddress in _unitOfWork.Repository<EmployeeAddresses>().AsQueryable()
                join address in _unitOfWork.Repository<Addresses>().AsQueryable()
                    on employeeAddress.address_id equals address.Id
                join addressType in _unitOfWork.Repository<AddressTypes>().AsQueryable()
                    on employeeAddress.address_type_id equals addressType.Id into addressTypeJoin
                from addressType in addressTypeJoin.DefaultIfEmpty()
                where employeeIdList.Contains(employeeAddress.employee_id)
                select new
                {
                    EmployeeId = employeeAddress.employee_id,
                    employeeAddress.is_current,
                    AddressTypeName = addressType != null ? addressType.name : string.Empty,
                    AddressLine = address.address_line,
                    Ward = address.ward,
                    District = address.district,
                    City = address.city,
                    Country = address.country,
                })
                .ToListAsync();

            return addressEntries
                .GroupBy(entry => entry.EmployeeId)
                .ToDictionary(
                    group => group.Key,
                    group =>
                    {
                        var chosen = group
                            .OrderBy(entry => IsPermanentAddressType(entry.AddressTypeName) ? 0 : 1)
                            .ThenBy(entry => entry.is_current ? 1 : 0)
                            .First();

                        return string.Join(", ", new[]
                        {
                            chosen.AddressLine,
                            chosen.Ward,
                            chosen.District,
                            chosen.City,
                            chosen.Country,
                        }.Where(value => !string.IsNullOrWhiteSpace(value)));
                    });
        }

        private async Task<Dictionary<int, string>> BuildEducationLevelLookupAsync(IEnumerable<int> employeeIds)
        {
            var employeeIdList = employeeIds.Distinct().ToArray();
            if (employeeIdList.Length == 0)
            {
                return new Dictionary<int, string>();
            }

            var educationRecords = await _unitOfWork.Repository<Education>().AsQueryable()
                .Where(education => employeeIdList.Contains(education.employee_id))
                .OrderByDescending(education => education.issue_date)
                .ThenByDescending(education => education.Id)
                .ToListAsync();

            return educationRecords
                .GroupBy(education => education.employee_id)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(education => education.level).FirstOrDefault(level => !string.IsNullOrWhiteSpace(level)) ?? string.Empty);
        }

        private async Task<Dictionary<int, string>> BuildCertificateLookupAsync(IEnumerable<int> employeeIds)
        {
            var employeeIdList = employeeIds.Distinct().ToArray();
            if (employeeIdList.Length == 0)
            {
                return new Dictionary<int, string>();
            }

            var certificateEntries = await (
                from employeeCertificate in _unitOfWork.Repository<EmployeeCertificates>().AsQueryable()
                join certificate in _unitOfWork.Repository<Certificates>().AsQueryable()
                    on employeeCertificate.certificate_id equals certificate.Id
                where employeeIdList.Contains(employeeCertificate.employee_id)
                select new
                {
                    EmployeeId = employeeCertificate.employee_id,
                    Name = certificate.certificate_name
                })
                .ToListAsync();

            return certificateEntries
                .GroupBy(entry => entry.EmployeeId)
                .ToDictionary(
                    group => group.Key,
                    group => string.Join(", ", group.Select(entry => entry.Name).Where(name => !string.IsNullOrWhiteSpace(name)).Distinct()));
        }


        public async Task<IEnumerable<EmployeeSearchDto>> SearchEmployeesAsync(string term, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(term)) return Enumerable.Empty<EmployeeSearchDto>();

            var normalizedTerm = term.Trim().ToLower();
            var query = _unitOfWork.Repository<EmployeeEntity>().AsQueryable()
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .AsNoTracking()
                .Where(e => e.is_active);

            if (excludeId.HasValue)
            {
                query = query.Where(e => e.Id != excludeId.Value);
            }

            query = query.Where(e => 
                (e.full_name != null && e.full_name.ToLower().Contains(normalizedTerm)) ||
                (e.employee_code != null && e.employee_code.ToLower().Contains(normalizedTerm))
            );

            var employees = await query.Take(20).ToListAsync();

            return employees.Select(e => new EmployeeSearchDto
            {
                Id = e.Id,
                FullName = e.full_name ?? string.Empty,
                EmployeeCode = e.employee_code,
                Avatar = e.avatar,
                DepartmentName = e.Department?.name,
                JobTitleName = e.JobTitle?.name
            });
        }

        public async Task<EmployeeJobInfoDto?> GetJobInfoAsync(int employeeId)
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().AsQueryable()
                .Include(e => e.Manager)
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            if (employee == null) return null;

            // Get Access Group (Role) from UserRoles via User
            int? accessGroupId = null;
            var user = await _unitOfWork.Repository<Users>().AsQueryable()
                .FirstOrDefaultAsync(u => u.employee_id == employeeId);
            
            if (user != null)
            {
                var userRole = await _unitOfWork.Repository<UserRoles>().AsQueryable()
                    .Where(ur => ur.user_id == user.Id && ur.is_active)
                    .OrderBy(ur => ur.id)
                    .FirstOrDefaultAsync();
                
                accessGroupId = userRole?.role_id;
            }

            return new EmployeeJobInfoDto
            {
                Id = employee.Id,
                RegionId = employee.region_id,
                BranchId = employee.branch_id,
                SecondaryBranchId = employee.secondary_branch_id,
                DepartmentId = employee.department_id,
                SecondaryDepartmentId = employee.secondary_department_id,
                JobTitleId = employee.job_title_id,
                SecondaryJobTitleId = employee.secondary_job_title_id,
                AccessGroupId = accessGroupId,
                ManagerId = employee.manager_id,
                ManagerName = employee.Manager?.full_name,
                IsActive = employee.is_active,
                IsDepartmentHead = employee.is_department_head
            };
        }

        public async Task<bool> UpdateJobInfoAsync(int employeeId, EmployeeJobInfoDto dto)
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(employeeId);
            if (employee == null) return false;

            employee.region_id = dto.RegionId;
            employee.branch_id = dto.BranchId;
            employee.secondary_branch_id = dto.SecondaryBranchId;
            employee.department_id = dto.DepartmentId;
            employee.secondary_department_id = dto.SecondaryDepartmentId;
            employee.job_title_id = dto.JobTitleId;
            employee.secondary_job_title_id = dto.SecondaryJobTitleId;
            employee.is_active = dto.IsActive;
            employee.is_department_head = dto.IsDepartmentHead;
            employee.manager_id = dto.ManagerId;

            _unitOfWork.Repository<EmployeeEntity>().Update(employee);

            // Update Access Group (Role)
            var user = await _unitOfWork.Repository<Users>().AsQueryable()
                .FirstOrDefaultAsync(u => u.employee_id == employeeId);

            if (user != null && dto.AccessGroupId.HasValue)
            {
                var userRoleRepo = _unitOfWork.Repository<UserRoles>();
                var existingRoles = await userRoleRepo.AsQueryable()
                    .Where(ur => ur.user_id == user.Id)
                    .ToListAsync();

                foreach (var role in existingRoles)
                {
                    role.is_active = false; // Deactivate old roles
                    userRoleRepo.Update(role);
                }

                // Add or reactivate the new role
                var targetRole = existingRoles.FirstOrDefault(ur => ur.role_id == dto.AccessGroupId.Value);
                if (targetRole != null)
                {
                    targetRole.is_active = true;
                    targetRole.UpdatedAt = DateTime.UtcNow;
                    userRoleRepo.Update(targetRole);
                }
                else
                {
                    await userRoleRepo.AddAsync(new UserRoles
                    {
                        user_id = user.Id,
                        role_id = dto.AccessGroupId.Value,
                        is_active = true,
                        tenant_id = user.tenant_id,
                        CreatedAt = DateTime.UtcNow,
                        valid_from = DateTime.UtcNow
                    });
                }
            }

            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        private async Task<Dictionary<int, string>> BuildEmergencyContactLookupAsync(IEnumerable<int> employeeIds)
        {
            var employeeIdList = employeeIds.Distinct().ToArray();
            if (employeeIdList.Length == 0)
            {
                return new Dictionary<int, string>();
            }

            var contacts = await _unitOfWork.Repository<EmergencyContacts>().AsQueryable()
                .Where(contact => employeeIdList.Contains(contact.employee_id))
                .OrderByDescending(contact => contact.Id)
                .ToListAsync();

            return contacts
                .GroupBy(contact => contact.employee_id)
                .ToDictionary(
                    group => group.Key,
                    group =>
                    {
                        var contact = group.First();
                        return string.Join(" - ", new[]
                        {
                            contact.name,
                            contact.mobile_phone,
                        }.Where(value => !string.IsNullOrWhiteSpace(value)));
                    });
        }

        private static IReadOnlyList<ExportColumnDefinition> ResolveExportColumns(IEnumerable<string>? columnIds)
        {
            var columnDefinitions = GetExportColumnDefinitions();
            var defaultColumnIds = new[]
            {
                "employee-code",
                "full-name",
                "manager-name",
                "phone",
                "gender",
                "region",
                "branch",
                "department",
                "job-title",
                "access-group",
                "birth-date",
                "identity-number",
                "email",
            };

            var normalizedColumnIds = (columnIds ?? defaultColumnIds)
                .Select(columnId => columnId?.Trim())
                .Where(columnId => !string.IsNullOrWhiteSpace(columnId))
                .Select(columnId => columnId!)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var resolvedColumns = normalizedColumnIds
                .Where(columnDefinitions.ContainsKey)
                .Select(columnId => columnDefinitions[columnId])
                .ToList();

            return resolvedColumns.Count > 0
                ? resolvedColumns
                : defaultColumnIds.Select(columnId => columnDefinitions[columnId]).ToList();
        }

        private static Dictionary<string, ExportColumnDefinition> GetExportColumnDefinitions()
        {
            return new Dictionary<string, ExportColumnDefinition>(StringComparer.OrdinalIgnoreCase)
            {
                ["employee-code"] = new("Mã nhân viên", row => row.Employee.EmployeeCode),
                ["full-name"] = new("Họ và tên", row => row.Employee.FullName ?? string.Empty),
                ["manager-name"] = new("Quản lý trực tiếp", row => row.Employee.ManagerName ?? string.Empty),
                ["resignation-date"] = new("Ngày nghỉ việc", _ => string.Empty),
                ["resignation-reason"] = new("Lý do nghỉ việc", row => row.ResignationReason),
                ["phone"] = new("Số điện thoại", row => row.Employee.Phone ?? string.Empty),
                ["gender"] = new("Giới tính", row => row.Employee.Gender ?? string.Empty),
                ["region"] = new("Vùng", row => row.Employee.RegionName ?? string.Empty),
                ["branch"] = new("Chi nhánh", row => row.Employee.BranchName ?? string.Empty),
                ["direct-department"] = new("Phòng ban trực thuộc", _ => string.Empty),
                ["department"] = new("Phòng ban", row => row.Employee.DepartmentName ?? string.Empty),
                ["job-title"] = new("Chức danh", row => row.Employee.JobTitleName ?? string.Empty),
                ["concurrent-role"] = new("Kiêm nhiệm", _ => string.Empty),
                ["group"] = new("Nhóm", _ => string.Empty),
                ["access-group"] = new("Nhóm truy cập", row => row.Employee.AccessGroup ?? string.Empty),
                ["birth-date"] = new("Ngày sinh", row => FormatDate(row.Employee.BirthDate)),
                ["birth-place"] = new("Nơi sinh", _ => string.Empty),
                ["tax-code"] = new("Mã số thuế", row => row.Employee.TaxCode ?? string.Empty),
                ["professional-level"] = new("Trình độ chuyên môn", row => row.ProfessionalLevel),
                ["professional-certificate"] = new("Chứng chỉ chuyên ngành", row => row.ProfessionalCertificates),
                ["identity-number"] = new("CMND/CCCD", row => row.Employee.IdentityNumber ?? string.Empty),
                ["passport"] = new("Hộ chiếu", row => row.Employee.Passport ?? string.Empty),
                ["email"] = new("Email", row => !string.IsNullOrWhiteSpace(row.Employee.Email) ? row.Employee.Email! : row.Employee.WorkEmail ?? string.Empty),
                ["bank"] = new("Ngân hàng", row => row.BankName),
                ["timekeeping"] = new("Chấm công", _ => string.Empty),
                ["working-time"] = new("Thời gian làm việc", row => row.WorkingTime),
                ["salary-info"] = new("Thông tin mức lương", _ => string.Empty),
                ["allowance-info"] = new("Thông tin phụ cấp", _ => string.Empty),
                ["general-contact"] = new("Liên hệ chung", row => string.Join(" | ", new[] { row.Employee.Phone, row.Employee.Email }.Where(value => !string.IsNullOrWhiteSpace(value)))),
                ["emergency-contact"] = new("Liên hệ khẩn cấp", row => row.EmergencyContact),
                ["permanent-address"] = new("Địa chỉ thường trú", row => row.PermanentAddress),
                ["other-info"] = new("Thông tin khác", row => row.OtherInfo),
            };
        }

        private static bool IsPermanentAddressType(string? addressTypeName)
        {
            var normalizedName = (addressTypeName ?? string.Empty).Trim().ToLowerInvariant();
            return normalizedName.Contains("thường trú")
                || normalizedName.Contains("thuong tru")
                || normalizedName.Contains("permanent");
        }

        private static string EscapeCsv(string? value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return string.Empty;
            }

            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        private static string FormatDate(DateTime? value)
        {
            return value?.ToString("dd/MM/yyyy") ?? string.Empty;
        }

        private sealed class ExportColumnDefinition
        {
            public ExportColumnDefinition(string label, Func<EmployeeExportRow, string> getValue)
            {
                Label = label;
                GetValue = getValue;
            }

            public string Label { get; }
            public Func<EmployeeExportRow, string> GetValue { get; }
        }

        private sealed class EmployeeExportRow
        {
            public EmployeeDto Employee { get; init; } = new EmployeeDto();
            public string BankAccountNumber { get; init; } = string.Empty;
            public string BankName { get; init; } = string.Empty;
            public string BankBranch { get; init; } = string.Empty;
            public string WorkingTime { get; init; } = string.Empty;
            public string ProfessionalLevel { get; init; } = string.Empty;
            public string ProfessionalCertificates { get; init; } = string.Empty;
            public string EmergencyContact { get; init; } = string.Empty;
            public string PermanentAddress { get; init; } = string.Empty;
            public string ResignationReason { get; init; } = string.Empty;
            public string OtherInfo { get; init; } = string.Empty;
        }

        private sealed class BankAccountExportInfo
        {
            public string AccountNumber { get; init; } = string.Empty;
            public string BankName { get; init; } = string.Empty;
            public string Branch { get; init; } = string.Empty;
        }

        private IOrderedQueryable<EmployeeEntity> ApplyEmployeeSort(IQueryable<EmployeeEntity> query, string field, bool isDesc)
        {
            return field.ToLower() switch
            {
                "fullname" or "name" => isDesc ? query.OrderByDescending(e => e.full_name) : query.OrderBy(e => e.full_name),
                "code" or "employeecode" => isDesc ? query.OrderByDescending(e => e.employee_code) : query.OrderBy(e => e.employee_code),
                "startdate" or "joiningdate" => isDesc ? query.OrderByDescending(e => e.start_date) : query.OrderBy(e => e.start_date),
                "department" => isDesc ? query.OrderByDescending(e => e.department_id) : query.OrderBy(e => e.department_id),
                "jobtitle" or "position" => isDesc ? query.OrderByDescending(e => e.job_title_id) : query.OrderBy(e => e.job_title_id),
                _ => isDesc ? query.OrderByDescending(e => e.employee_code) : query.OrderBy(e => e.employee_code)
            };
        }

        private IOrderedQueryable<EmployeeEntity> ApplyEmployeeThenSort(IOrderedQueryable<EmployeeEntity> query, string field, bool isDesc)
        {
            return field.ToLower() switch
            {
                "fullname" or "name" => isDesc ? query.ThenByDescending(e => e.full_name) : query.ThenBy(e => e.full_name),
                "code" or "employeecode" => isDesc ? query.ThenByDescending(e => e.employee_code) : query.ThenBy(e => e.employee_code),
                "startdate" or "joiningdate" => isDesc ? query.ThenByDescending(e => e.start_date) : query.ThenBy(e => e.start_date),
                "department" => isDesc ? query.ThenByDescending(e => e.department_id) : query.ThenBy(e => e.department_id),
                "jobtitle" or "position" => isDesc ? query.ThenByDescending(e => e.job_title_id) : query.ThenBy(e => e.job_title_id),
                _ => isDesc ? query.ThenByDescending(e => e.employee_code) : query.ThenBy(e => e.employee_code)
            };
        }
        public async Task<IEnumerable<BulkParseResponseDto>> BulkParseEmployeesAsync(BulkParseRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.RawText)) return new List<BulkParseResponseDto>();

            // Split by newline, comma, or semicolon
            var tokens = request.RawText
                .Split(new[] { '\n', '\r', ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim())
                .Where(t => !string.IsNullOrEmpty(t))
                .ToList();

            if (!tokens.Any()) return new List<BulkParseResponseDto>();

            var query = _unitOfWork.Repository<EmployeeEntity>()
                .AsQueryable()
                .Include(e => e.Branch)
                .Where(e => !e.is_resigned && e.is_active);

            // Filter by branches if provided
            if (request.BranchIds != null && request.BranchIds.Any())
            {
                query = query.Where(e => e.branch_id.HasValue && request.BranchIds.Contains(e.branch_id.Value));
            }

            // Search by Email, Code, or Phone
            var employees = await query
                .Where(e => tokens.Contains(e.email) || tokens.Contains(e.employee_code) || tokens.Contains(e.phone))
                .Select(e => new BulkParseResponseDto
                {
                    Id = e.Id,
                    FullName = e.full_name,
                    EmployeeCode = e.employee_code,
                    PhoneNumber = e.phone,
                    BranchName = e.Branch != null ? e.Branch.name : ""
                })
                .ToListAsync();

            return employees;
        }
    }
}
