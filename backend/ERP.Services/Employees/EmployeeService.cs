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
using EmployeeEntity = ERP.Entities.Models.Employees;

namespace ERP.Services.Employees
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuthService _authService;

        public EmployeeService(IUnitOfWork unitOfWork, IAuthService authService)
        {
            _unitOfWork = unitOfWork;
            _authService = authService;
        }

        public async Task<PaginatedListDto<EmployeeDto>> GetPagedListAsync(EmployeeFilterDto filter)
        {
            var employees = await _unitOfWork.Repository<EmployeeEntity>().GetAllAsync();
            var query = employees.AsQueryable();

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
            if (filter.Status == "active")
                query = query.Where(e => e.is_active && !e.is_resigned);
            else if (filter.Status == "resigned")
                query = query.Where(e => e.is_resigned);
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
                // Mặc định sắp xếp theo mã nhân viên
                query = query.OrderBy(e => e.employee_code);
            }

            // 8. Pagination
            var count = query.Count();
            var items = query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(e => MapToDto(e))
                .ToList();

            return new PaginatedListDto<EmployeeDto>(items, count, filter.PageNumber, filter.PageSize);
        }

        public async Task<EmployeeDto?> GetByIdAsync(int id)
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(id);
            return employee != null ? MapToDto(employee) : null;
        }

        public async Task<EmployeeFullProfileDto?> GetFullProfileAsync(int id)
        {
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
            // 1. Check for duplicates
            var existingByCode = await _unitOfWork.Repository<EmployeeEntity>().FindAsync(e => e.employee_code == dto.EmployeeCode);
            if (existingByCode.Any())
            {
                throw new Exception($"Mã nhân viên '{dto.EmployeeCode}' đã tồn tại.");
            }

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var existingByEmail = await _unitOfWork.Repository<EmployeeEntity>().FindAsync(e => e.email == dto.Email);
                if (existingByEmail.Any())
                {
                    throw new Exception($"Email '{dto.Email}' đã tồn tại.");
                }
            }

            // 2. Create Employee
            var employee = new EmployeeEntity
            {
                employee_code = dto.EmployeeCode,
                full_name = dto.FullName,
                email = dto.Email,
                phone = dto.Phone,
                birth_date = dto.BirthDate,
                gender_code = dto.GenderCode,
                marital_status_code = dto.MaritalStatusCode,
                department_id = dto.DepartmentId,
                job_title_id = dto.JobTitleId,
                branch_id = dto.BranchId,
                manager_id = dto.ManagerId,
                start_date = dto.StartDate,
                identity_number = dto.IdentityNumber,
                work_email = dto.WorkEmail,
                avatar = dto.Avatar,
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<EmployeeEntity>().AddAsync(employee);
            await _unitOfWork.SaveChangesAsync();

            // 3. Create Firebase User via AuthService (which also creates local User and Role)
            await _authService.CreateFirebaseUserAsync(
                dto.Email ?? dto.EmployeeCode, 
                dto.Password, 
                dto.FullName, 
                employee.Id);

            return MapToDto(employee);
        }

        public async Task<bool> UpdateAsync(int id, EmployeeUpdateDto dto)
        {
            var employee = await _unitOfWork.Repository<EmployeeEntity>().GetByIdAsync(id);
            if (employee == null) return false;

            employee.full_name = dto.FullName;
            employee.email = dto.Email;
            employee.phone = dto.Phone;
            employee.birth_date = dto.BirthDate;
            employee.gender_code = dto.GenderCode;
            employee.marital_status_code = dto.MaritalStatusCode;
            employee.department_id = dto.DepartmentId;
            employee.job_title_id = dto.JobTitleId;
            employee.branch_id = dto.BranchId;
            employee.manager_id = dto.ManagerId;
            employee.start_date = dto.StartDate;
            employee.identity_number = dto.IdentityNumber;
            employee.work_email = dto.WorkEmail;
            employee.avatar = dto.Avatar;
            employee.is_active = dto.IsActive;
            employee.is_resigned = dto.IsResigned;
            employee.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<EmployeeEntity>().Update(employee);
            return await _unitOfWork.SaveChangesAsync() > 0;
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
            var employees = await _unitOfWork.Repository<EmployeeEntity>().GetAllAsync();
            
            // Collect all numeric parts from ACTIVE employees using this prefix
            var takenNumbers = employees
                .Where(e => e.is_active && e.employee_code.StartsWith(prefix))
                .Select(e => {
                    var numericPart = e.employee_code.Substring(prefix.Length);
                    return int.TryParse(numericPart, out int result) ? result : 0;
                })
                .Where(n => n > 0)
                .OrderBy(n => n)
                .Distinct()
                .ToList();

            // Find the first gap (smallest missing positive)
            int candidate = 1;
            foreach (var num in takenNumbers)
            {
                if (num == candidate)
                {
                    candidate++;
                }
                else if (num > candidate)
                {
                    break; // Found a gap
                }
            }

            return $"{prefix}{candidate:D4}"; // Format as PrefixXXXX (e.g., NV0001)
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

        public async Task<byte[]> ExportEmployeesToCsvAsync()
        {
            var employees = await _unitOfWork.Repository<EmployeeEntity>().GetAllAsync();
            var activeEmployees = employees.Where(e => e.is_active).ToList();

            var sb = new StringBuilder();
            sb.AppendLine("ID,Mã NV,Họ Tên,Email,Số điện thoại,Phòng ban,Ngày bắt đầu,Trạng thái");

            foreach (var emp in activeEmployees)
            {
                var departmentName = "";
                if (emp.department_id.HasValue)
                {
                    var dept = await _unitOfWork.Repository<Departments>().GetByIdAsync(emp.department_id.Value);
                    departmentName = dept?.name ?? "";
                }

                sb.AppendLine($"{emp.Id},{emp.employee_code},{emp.full_name},{emp.email},{emp.phone},{departmentName},{emp.start_date:yyyy-MM-dd},{(emp.is_active ? "Đang làm việc" : "Nghỉ việc")}");
            }

            return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        }

        private EmployeeDto MapToDto(EmployeeEntity e)
        {
            return new EmployeeDto
            {
                Id = e.Id,
                EmployeeCode = e.employee_code,
                FullName = e.full_name,
                BirthDate = e.birth_date,
                Email = e.email,
                Phone = e.phone,
                IdentityNumber = e.identity_number,
                StartDate = e.start_date,
                IsActive = e.is_active,
                IsResigned = e.is_resigned,
                DepartmentId = e.department_id,
                JobTitleId = e.job_title_id,
                BranchId = e.branch_id,
                ManagerId = e.manager_id,
                WorkEmail = e.work_email,
                Avatar = e.avatar
            };
        }
    }
}
