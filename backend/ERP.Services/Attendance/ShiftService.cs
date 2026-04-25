using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Attendance;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using ERP.Services.Authorization;
using ERP.Entities.Interfaces;
using ClosedXML.Excel;


namespace ERP.Services.Attendance
{
    public class ShiftService : IShiftService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuthorizationService _authService;
        private readonly ICurrentUserContext _userContext;

        public ShiftService(IUnitOfWork unitOfWork,
            IAuthorizationService authService,
            ICurrentUserContext userContext)
        {
            _unitOfWork = unitOfWork;
            _authService = authService;
            _userContext = userContext;
        }

        private static string BuildAssignmentSlotKey(int employeeId, DateTime assignmentDate)
            => $"{employeeId}:{assignmentDate:yyyy-MM-dd}";

        private static HashSet<DayOfWeek> ResolveRepeatDays(IEnumerable<string>? repeatDays, DateTime fallbackDate)
        {
            var resolvedDays = new HashSet<DayOfWeek>();

            foreach (var rawDay in repeatDays ?? Enumerable.Empty<string>())
            {
                if (string.IsNullOrWhiteSpace(rawDay))
                {
                    continue;
                }

                var token = rawDay.Trim()
                    .ToLowerInvariant()
                    .Replace("_", string.Empty)
                    .Replace("-", string.Empty)
                    .Replace(" ", string.Empty);

                switch (token)
                {
                    case "1":
                    case "mon":
                    case "monday":
                    case "t2":
                    case "thu2":
                        resolvedDays.Add(DayOfWeek.Monday);
                        break;
                    case "2":
                    case "tue":
                    case "tuesday":
                    case "t3":
                    case "thu3":
                        resolvedDays.Add(DayOfWeek.Tuesday);
                        break;
                    case "3":
                    case "wed":
                    case "wednesday":
                    case "t4":
                    case "thu4":
                        resolvedDays.Add(DayOfWeek.Wednesday);
                        break;
                    case "4":
                    case "thu":
                    case "thursday":
                    case "t5":
                    case "thu5":
                        resolvedDays.Add(DayOfWeek.Thursday);
                        break;
                    case "5":
                    case "fri":
                    case "friday":
                    case "t6":
                    case "thu6":
                        resolvedDays.Add(DayOfWeek.Friday);
                        break;
                    case "6":
                    case "sat":
                    case "saturday":
                    case "t7":
                    case "thu7":
                        resolvedDays.Add(DayOfWeek.Saturday);
                        break;
                    case "7":
                    case "sun":
                    case "sunday":
                    case "cn":
                    case "chunhat":
                        resolvedDays.Add(DayOfWeek.Sunday);
                        break;
                }
            }

            if (resolvedDays.Count == 0)
            {
                resolvedDays.Add(fallbackDate.DayOfWeek);
            }

            return resolvedDays;
        }

        private async Task EnsureBranchAccess(int branchId)
        {
            var currentUserId = _userContext.UserId ?? 0;
            if (currentUserId <= 0) return;

            var canAccess = await _authService.CanAccessBranch(currentUserId, branchId);
            if (!canAccess)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập dữ liệu của chi nhánh này.");
            }
        }

        private async Task EnsureEmployeeAccess(int employeeId)
        {
            var currentUserId = _userContext.UserId ?? 0;
            if (currentUserId <= 0) return;

            var canAccess = await _authService.CanAccessEmployee(currentUserId, employeeId);
            if (!canAccess)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập dữ liệu của nhân viên này.");
            }
        }

        public async Task<WeeklyShiftScheduleDto> GetWeeklyScheduleAsync(int branchId, DateTime startDate)
        {
            await EnsureBranchAccess(branchId);
            var endDate = startDate.AddDays(6);
            var today = DateTime.Today;

            // 1. Get branch info
            var branch = await _unitOfWork.Repository<Branches>().GetByIdAsync(branchId);
            
            // 2. Get active employees in the branch
            var employees = await _unitOfWork.Repository<ERP.Entities.Models.Employees>()
                .AsQueryable()
                .Where(e => e.branch_id == branchId && e.is_active && !e.is_resigned)
                .OrderBy(e => e.employee_code)
                .ToListAsync();

            var employeeIds = employees.Select(e => e.Id).ToList();

            // 3. Get all shift assignments for these employees in the 7-day range
            var assignments = await _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Include(a => a.Shift)
                .Where(a => employeeIds.Contains(a.employee_id) && 
                            a.assignment_date.Date >= startDate.Date && 
                            a.assignment_date.Date <= endDate.Date)
                .ToListAsync();

            // 4. Build matrix
            var result = new WeeklyShiftScheduleDto
            {
                BranchId = branchId,
                BranchName = branch?.name,
                StartDate = startDate,
                EndDate = endDate,
                Employees = new List<EmployeeShiftMatrixDto>()
            };

            foreach (var emp in employees)
            {
                var empMatrix = new EmployeeShiftMatrixDto
                {
                    EmployeeId = emp.Id,
                    FullName = emp.full_name ?? string.Empty,
                    EmployeeCode = emp.employee_code ?? string.Empty,
                    Days = new List<DayShiftDto>()
                };

                for (int i = 0; i < 7; i++)
                {
                    var currentDate = startDate.AddDays(i);
                    var dayShifts = assignments
                        .Where(a => a.employee_id == emp.Id && a.assignment_date.Date == currentDate.Date)
                        .Select(a => new ShiftSummaryDto
                        {
                            Id = a.Shift.Id,
                            ShiftCode = a.Shift.shift_code,
                            ShiftName = a.Shift.shift_name,
                            StartTime = a.Shift.start_time.ToString(@"hh\:mm"),
                            EndTime = a.Shift.end_time.ToString(@"hh\:mm"),
                            Color = a.Shift.color
                        })
                        .ToList();

                    empMatrix.Days.Add(new DayShiftDto
                    {
                        Date = currentDate,
                        DayOfWeek = currentDate.DayOfWeek.ToString(),
                        Shifts = dayShifts
                    });
                }

                result.Employees.Add(empMatrix);
            }

            return result;
        }

        public async Task<ShiftAttendanceDetailDto> GetShiftAttendanceDetailAsync(int employeeId, DateTime date)
        {
            await EnsureEmployeeAccess(employeeId);
            var startDate = date.Date;
            var endDate = startDate.AddDays(1);

            // 1. Get shift assignment
            var assignment = await _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Include(a => a.Shift)
                .FirstOrDefaultAsync(a => a.employee_id == employeeId && a.assignment_date.Date == startDate);

            // 2. Get attendance records
            var attendanceRecords = await _unitOfWork.Repository<AttendanceRecords>()
                .AsQueryable()
                .Where(r => r.employee_id == employeeId && r.record_time >= startDate && r.record_time < endDate)
                .OrderBy(r => r.record_time)
                .ToListAsync();

            return new ShiftAttendanceDetailDto
            {
                Shift = assignment != null ? new ShiftSummaryDto
                {
                    Id = assignment.Shift.Id,
                    ShiftCode = assignment.Shift.shift_code,
                    ShiftName = assignment.Shift.shift_name,
                    StartTime = assignment.Shift.start_time.ToString(@"hh\:mm"),
                    EndTime = assignment.Shift.end_time.ToString(@"hh\:mm"),
                    Color = assignment.Shift.color
                } : null,
                Attendance = attendanceRecords.Select(r => new AttendanceRecordDto
                {
                    Id = r.Id,
                    EmployeeId = r.employee_id,
                    RecordTime = r.record_time,
                    RecordType = r.record_type,
                    Source = r.source,
                    Note = r.note,
                    Verified = r.verified,
                    Latitude = r.location_lat,
                    Longitude = r.location_lng
                }).ToList()
            };
        }

        public async Task<bool> DeleteShiftAssignmentAsync(int employeeId, DateTime date)
        {
            await EnsureEmployeeAccess(employeeId);
            var assignment = await _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .FirstOrDefaultAsync(a => a.employee_id == employeeId && a.assignment_date.Date == date.Date);

            if (assignment == null) return false;

            _unitOfWork.Repository<ShiftAssignments>().Remove(assignment);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<WeeklyScheduleApiOpenShiftDto>> GetOpenShiftsAsync(DateTime startDate, DateTime endDate, int? branchId)
        {
            var query = _unitOfWork.Repository<OpenShifts>()
                .AsQueryable()
                .Include(o => o.Shift)
                .Include(o => o.Branch)
                .Include(o => o.JobTitle)
                .Where(o => o.open_date >= startDate && o.open_date < endDate);

            if (branchId.HasValue)
                query = query.Where(o => o.branch_id == branchId.Value);

            var openShifts = await query.ToListAsync();

            return openShifts.Select(o => new WeeklyScheduleApiOpenShiftDto
            {
                Id = o.Id,
                ShiftId = o.shift_id,
                ShiftName = o.Shift?.shift_name,
                StartTime = o.Shift?.start_time.ToString(@"hh\:mm"),
                EndTime = o.Shift?.end_time.ToString(@"hh\:mm"),
                OpenDate = o.open_date.ToString("yyyy-MM-dd"),
                Status = o.status,
                Color = o.Shift?.color,
                RequiredQuantity = o.required_quantity,
                AssignedQuantity = 0,
                BranchId = o.branch_id,
                BranchName = o.Branch?.name,
                DepartmentId = o.department_id,
                JobTitleId = o.job_title_id,
                JobTitleName = o.JobTitle?.name
            });
        }

        public async Task<int> CreateShiftAsync(ShiftCreateDto dto)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Format keyword: UPPERCASE, no accents, joined by _
                var formattedKeyword = dto.Keyword.Trim().ToUpper()
                    .Replace(" ", "_"); // Simple formatting for now

                // Validate unique keyword
                var existingKeyword = await _unitOfWork.Repository<Shifts>().AsQueryable()
                    .AnyAsync(s => s.keyword == formattedKeyword);
                if (existingKeyword) throw new Exception($"Từ khóa {formattedKeyword} đã tồn tại trong hệ thống.");

                // 1. Create Shift Template
                var shift = new Shifts
                {
                    shift_code = dto.ShiftCode,
                    shift_name = dto.ShiftName,
                    start_time = dto.StartTime,
                    end_time = dto.EndTime,
                    break_start = dto.BreakStart,
                    break_end = dto.BreakEnd,
                    grace_period_in = dto.GracePeriodIn,
                    grace_period_out = dto.GracePeriodOut,
                    min_checkin_before = dto.MinCheckinBefore,
                    is_overnight = dto.IsOvernight,
                    color = string.IsNullOrEmpty(dto.Color) ? "#3B82F6" : dto.Color,
                    shift_type_id = dto.ShiftTypeId == 0 ? 1 : dto.ShiftTypeId,
                    is_active = true,
                    note = dto.Note,
                    default_branch_ids = dto.BranchIds != null ? string.Join(",", dto.BranchIds) : null,
                    default_department_ids = dto.DepartmentIds != null ? string.Join(",", dto.DepartmentIds) : null,
                    default_job_title_ids = dto.JobTitleIds != null ? string.Join(",", dto.JobTitleIds) : null,

                    // New fields (AC1, AC2, AC3)
                    keyword = formattedKeyword,
                    standard_effort = dto.StandardEffort,
                    symbol = dto.Symbol,
                    checkin_window_start = dto.CheckinWindowStart,
                    checkin_window_end = dto.CheckinWindowEnd,
                    checkout_window_start = dto.CheckoutWindowStart,
                    checkout_window_end = dto.CheckoutWindowEnd,
                    allowed_late_mins = dto.AllowedLateMins,
                    allowed_early_mins = dto.AllowedEarlyMins,
                    max_late_mins = dto.MaxLateMins,
                    max_early_mins = dto.MaxEarlyMins,
                    checkin_requirement = dto.CheckinRequirement,
                    checkout_requirement = dto.CheckoutRequirement,
                    timezone = dto.Timezone ?? "Asia/Saigon",
                    start_date = dto.StartDate,
                    end_date = dto.EndDate,
                    min_working_hours = dto.MinWorkingHours,
                    meal_type_id = dto.MealTypeId,
                    meal_count = dto.MealCount,
                    is_overtime_shift = dto.IsOvertimeShift
                };

                await _unitOfWork.Repository<Shifts>().AddAsync(shift);
                await _unitOfWork.SaveChangesAsync();

                // T300: Bulk Assignment if AssignDate and Filters are provided
                if (dto.IsPublished && dto.AssignDate.HasValue &&
                    (dto.BranchIds?.Any() == true || dto.DepartmentIds?.Any() == true || dto.JobTitleIds?.Any() == true))
                {
                    var query = _unitOfWork.Repository<ERP.Entities.Models.Employees>().AsQueryable()
                        .Where(e => e.is_active && !e.is_resigned && e.branch_id != null && e.department_id != null);

                    if (dto.BranchIds?.Any() == true) query = query.Where(e => e.branch_id != null && dto.BranchIds.Contains(e.branch_id.Value));
                    if (dto.DepartmentIds?.Any() == true) query = query.Where(e => e.department_id != null && dto.DepartmentIds.Contains(e.department_id.Value));
                    if (dto.JobTitleIds?.Any() == true) query = query.Where(e => e.job_title_id != null && dto.JobTitleIds.Contains(e.job_title_id.Value));

                    var matchingEmployees = await query.ToListAsync();
                    var startDate = dto.AssignDate.Value.Date;
                    var horizonEndDate = startDate.AddMonths(6);
                    var selectedDays = ResolveRepeatDays(dto.RepeatDays, startDate);

                    var assignmentsToCreate = new List<ShiftAssignments>();
                    var now = DateTime.UtcNow;
                    var employeeIds = matchingEmployees.Select(emp => emp.Id).ToList();
                    var existingAssignmentKeys = new HashSet<string>();

                    if (employeeIds.Count > 0)
                    {
                        var existingAssignments = await _unitOfWork.Repository<ShiftAssignments>()
                            .AsQueryable()
                            .Where(a =>
                                a.shift_id == shift.Id &&
                                employeeIds.Contains(a.employee_id) &&
                                a.assignment_date >= startDate &&
                                a.assignment_date <= horizonEndDate)
                            .Select(a => new
                            {
                                a.employee_id,
                                AssignmentDate = a.assignment_date
                            })
                            .ToListAsync();

                        existingAssignmentKeys = existingAssignments
                            .Select(item => BuildAssignmentSlotKey(item.employee_id, item.AssignmentDate.Date))
                            .ToHashSet(StringComparer.OrdinalIgnoreCase);
                    }

                    foreach (var emp in matchingEmployees)
                    {
                        for (var date = startDate; date <= horizonEndDate; date = date.AddDays(1))
                        {
                            if (!selectedDays.Contains(date.DayOfWeek))
                            {
                                continue;
                            }

                            var slotKey = BuildAssignmentSlotKey(emp.Id, date);
                            if (existingAssignmentKeys.Contains(slotKey))
                            {
                                continue;
                            }

                            assignmentsToCreate.Add(new ShiftAssignments
                            {
                                tenant_id = shift.tenant_id,
                                employee_id = emp.Id,
                                shift_id = shift.Id,
                                assignment_date = date,
                                is_published = true,
                                status = "published",
                                published_at = now,
                                CreatedAt = now,
                                UpdatedAt = now,
                                note = "Tự động gán hàng loạt trong 6 tháng"
                            });

                            existingAssignmentKeys.Add(slotKey);
                        }
                    }

                    if (assignmentsToCreate.Any())
                    {
                        await _unitOfWork.Repository<ShiftAssignments>().AddRangeAsync(assignmentsToCreate);
                        await _unitOfWork.SaveChangesAsync();
                    }
                }

                // 2. Optional Assignment (T201)
                if (dto.AssignToUserId.HasValue && dto.AssignDate.HasValue)
                {
                    var user = await _unitOfWork.Repository<Users>().GetByIdAsync(dto.AssignToUserId.Value);
                    if (user == null) throw new Exception($"Không tìm thấy người dùng ID {dto.AssignToUserId.Value}");

                    var assignment = new ShiftAssignments
                    {
                        tenant_id = shift.tenant_id,
                        employee_id = user.employee_id,
                        shift_id = shift.Id,
                        assignment_date = dto.AssignDate.Value,
                        is_published = true,
                        status = "published",
                        published_at = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        note = "Tự động gán khi tạo ca (Template)"
                    };

                    await _unitOfWork.Repository<ShiftAssignments>().AddAsync(assignment);
                    await _unitOfWork.SaveChangesAsync();
                }

                await _unitOfWork.CommitTransactionAsync();
                return shift.Id;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<ShiftDetailDto?> GetShiftDetailAsync(int shiftId)
        {
            var shift = await _unitOfWork.Repository<Shifts>().GetByIdAsync(shiftId);
            if (shift == null) return null;

            return new ShiftDetailDto
            {
                Id = shift.Id,
                ShiftCode = shift.shift_code,
                ShiftName = shift.shift_name,
                StartTime = shift.start_time,
                EndTime = shift.end_time,
                Color = shift.color,
                DefaultBranchIds = ParseIds(shift.default_branch_ids),
                DefaultDepartmentIds = ParseIds(shift.default_department_ids),
                DefaultPositionIds = ParseIds(shift.default_job_title_ids)
            };
        }

        private List<int> ParseIds(string? idsString)
        {
            if (string.IsNullOrEmpty(idsString)) return new List<int>();
            return idsString.Split(',', StringSplitOptions.RemoveEmptyEntries)
                           .Select(s => int.TryParse(s.Trim(), out int id) ? id : (int?)null)
                           .Where(id => id.HasValue)
                           .Select(id => id!.Value)
                           .ToList();
        }

        public async Task<bool> CreateOpenShiftsAsync(OpenShiftCreateDto dto)
        {
            if (dto.BranchIds == null || !dto.BranchIds.Any() || 
                dto.DepartmentIds == null || !dto.DepartmentIds.Any() || 
                dto.PositionIds == null || !dto.PositionIds.Any())
            {
                throw new Exception("Danh sách Chi nhánh, Phòng ban và Chức danh không được để trống.");
            }

            // Verify Shift existence first to avoid FK constraint errors
            var shiftExists = await _unitOfWork.Repository<Shifts>().AsQueryable()
                .AnyAsync(s => s.Id == dto.ShiftId);

            if (!shiftExists)
            {
                throw new Exception($"Lỗi: Loại ca làm việc (ID: {dto.ShiftId}) không tồn tại trong hệ thống hoặc bạn không có quyền truy cập. Vui lòng làm mới danh sách mẫu ca và thử lại.");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                foreach (var bid in dto.BranchIds)
                {
                    await EnsureBranchAccess(bid);
                    foreach (var did in dto.DepartmentIds)
                    {
                        foreach (var pid in dto.PositionIds)
                        {
                            var openShift = new OpenShifts
                            {
                                shift_id = dto.ShiftId,
                                branch_id = bid,
                                department_id = did,
                                job_title_id = pid,
                                required_quantity = dto.Quantity,
                                auto_publish = dto.IsAutoPublish,
                                open_date = dto.Date,
                                status = "OPEN",
                                note = dto.Note ?? "",
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };

                            var dateOnly = dto.Date.Date;
                            var nextDay = dateOnly.AddDays(1);

                            var existingList = await _unitOfWork.Repository<OpenShifts>()
                                .FindAsync(o => o.shift_id == dto.ShiftId 
                                    && o.branch_id == bid 
                                    && o.department_id == did 
                                    && o.job_title_id == pid 
                                    && o.open_date >= dateOnly 
                                    && o.open_date < nextDay);

                            if (existingList.Any()) 
                            {
                                var existing = existingList.First();
                                existing.required_quantity = dto.Quantity;
                                _unitOfWork.Repository<OpenShifts>().Update(existing);
                            } 
                            else 
                            {
                                await _unitOfWork.Repository<OpenShifts>().AddAsync(openShift);
                            }

                            // T300: Auto Assignment to employees if AutoPublish is enabled
                            if (dto.IsAutoPublish)
                            {
                                var matchingEmployees = await _unitOfWork.Repository<ERP.Entities.Models.Employees>()
                                    .AsQueryable()
                                    .Where(e => e.branch_id == bid 
                                             && e.department_id == did 
                                             && e.job_title_id == pid 
                                             && e.is_active 
                                             && !e.is_resigned)
                                    .ToListAsync();

                                foreach (var emp in matchingEmployees)
                                {
                                    // Check if employee already has an assignment for this shift on this day to avoid duplicates
                                    var existingAssignment = await _unitOfWork.Repository<ShiftAssignments>()
                                        .AsQueryable()
                                        .AnyAsync(a => a.employee_id == emp.Id 
                                                    && a.shift_id == dto.ShiftId 
                                                    && a.assignment_date.Date == dateOnly);

                                    if (!existingAssignment)
                                    {
                                        var assignment = new ShiftAssignments
                                        {
                                            employee_id = emp.Id,
                                            shift_id = dto.ShiftId,
                                            assignment_date = dateOnly,
                                            is_published = true,
                                            status = "published",
                                            published_at = DateTime.UtcNow,
                                            CreatedAt = DateTime.UtcNow,
                                            UpdatedAt = DateTime.UtcNow,
                                            note = "Tự động gán từ Ca mở (Auto-Publish)"
                                        };
                                        await _unitOfWork.Repository<ShiftAssignments>().AddAsync(assignment);
                                    }
                                }
                            }
                        }
                    }
                }

                var result = await _unitOfWork.SaveChangesAsync() > 0;
                await _unitOfWork.CommitTransactionAsync();
                return result;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<IEnumerable<ShiftOptionApiItemDto>> GetShiftsAsync(bool? isActive, int? branchId)
        {
            var query = _unitOfWork.Repository<Shifts>().AsQueryable();

            if (isActive.HasValue)
            {
                query = query.Where(s => s.is_active == isActive.Value);
            }

            // We do a simple fetch. The branch/department relationships in the Shift template
            // are stored as CSV strings in `default_branch_ids` etc.
            var shifts = await query.ToListAsync();

            var result = new List<ShiftOptionApiItemDto>();
            foreach (var s in shifts)
            {
                var branchIds = ParseIds(s.default_branch_ids);
                var departmentIds = ParseIds(s.default_department_ids);
                var jobTitleIds = ParseIds(s.default_job_title_ids);

                // If branchId is provided, filter by it
                if (branchId.HasValue && branchIds.Any() && !branchIds.Contains(branchId.Value))
                {
                    continue; // Skip if this shift is strictly for other branches
                }

                result.Add(new ShiftOptionApiItemDto
                {
                    id = s.Id,
                    shift_id = s.Id,
                    shift_name = s.shift_name,
                    start_time = s.start_time.ToString(@"hh\:mm"),
                    end_time = s.end_time.ToString(@"hh\:mm"),
                    color = s.color,
                    note = s.note,
                    branch_ids = branchIds,
                    department_ids = departmentIds,
                    job_title_ids = jobTitleIds
                });
            }

            return result;
        }

        // Shift Configuration Management (T212 - T216)
        public async Task<PaginatedListDto<ShiftListDto>> GetShiftListAsync(string? search, TimeSpan? startTime, TimeSpan? endTime, bool? isActive, int skip, int take)
        {
            var query = _unitOfWork.Repository<Shifts>().AsQueryable();

            if (isActive.HasValue)
            {
                query = query.Where(s => s.is_active == isActive.Value);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s => 
                    (s.shift_name != null && s.shift_name.Contains(search)) || 
                    (s.shift_code != null && s.shift_code.Contains(search))
                );
            }

            if (startTime.HasValue && endTime.HasValue)
            {
                query = query.Where(s => s.start_time >= startTime.Value && s.end_time <= endTime.Value);
            }

            var total = await query.CountAsync();
            
            // Allow take=0 to mean "all" or specific handling. Here we just strictly evaluate
            if (take > 0) 
            {
                query = query.OrderBy(s => s.shift_code).Skip(skip).Take(take);
            }
            else 
            {
                query = query.OrderBy(s => s.shift_code);
                take = total > 0 ? total : 10;
            }

            var shifts = await query.ToListAsync();

            var mappedData = shifts.Select(s => new ShiftListDto
            {
                Id = s.Id,
                ShiftCode = s.shift_code,
                ShiftName = s.shift_name,
                StartTime = s.start_time.ToString(@"hh\:mm"),
                EndTime = s.end_time.ToString(@"hh\:mm"),
                DurationHours = s.is_overnight
                    ? (decimal)(s.end_time.Add(TimeSpan.FromDays(1)) - s.start_time).TotalHours
                    : (decimal)(s.end_time - s.start_time).TotalHours,
                IsActive = s.is_active,
                IsOvernight = s.is_overnight
            }).ToList();

            return new PaginatedListDto<ShiftListDto>(mappedData, total, skip / take + 1, take);
        }

        public async Task<bool> UpdateShiftAsync(int id, ShiftUpdateDto dto)
        {
            var shift = await _unitOfWork.Repository<Shifts>().GetByIdAsync(id);
            if (shift == null) throw new Exception("Không tìm thấy ca làm việc");

            var existingCode = await _unitOfWork.Repository<Shifts>().AsQueryable()
                .FirstOrDefaultAsync(s => s.shift_code == dto.shift_code && s.Id != id);
            
            if (existingCode != null) throw new Exception($"Mã ca {dto.shift_code} đã tồn tại trong hệ thống.");

            // Format and validate keyword
            var formattedKeyword = dto.keyword.Trim().ToUpper().Replace(" ", "_");
            var existingKeyword = await _unitOfWork.Repository<Shifts>().AsQueryable()
                .AnyAsync(s => s.keyword == formattedKeyword && s.Id != id);
            if (existingKeyword) throw new Exception($"Từ khóa {formattedKeyword} đã tồn tại trong hệ thống.");

            shift.shift_name = dto.shift_name;
            shift.shift_code = dto.shift_code;
            shift.start_time = TimeSpan.Parse(dto.start_time);
            shift.end_time = TimeSpan.Parse(dto.end_time);
            shift.break_start = string.IsNullOrEmpty(dto.break_start) ? null : TimeSpan.Parse(dto.break_start);
            shift.break_end = string.IsNullOrEmpty(dto.break_end) ? null : TimeSpan.Parse(dto.break_end);
            shift.grace_period_in = dto.grace_period_in;
            shift.grace_period_out = dto.grace_period_out;
            shift.min_checkin_before = dto.min_checkin_before;
            shift.is_overnight = dto.is_overnight;
            shift.color = dto.color;
            shift.shift_type_id = dto.shift_type_id;
            shift.is_active = dto.is_active;
            shift.note = dto.note;

            // New fields
            shift.keyword = formattedKeyword;
            shift.standard_effort = dto.standard_effort;
            shift.symbol = dto.symbol;
            shift.checkin_window_start = string.IsNullOrEmpty(dto.checkin_window_start) ? null : TimeSpan.Parse(dto.checkin_window_start);
            shift.checkin_window_end = string.IsNullOrEmpty(dto.checkin_window_end) ? null : TimeSpan.Parse(dto.checkin_window_end);
            shift.checkout_window_start = string.IsNullOrEmpty(dto.checkout_window_start) ? null : TimeSpan.Parse(dto.checkout_window_start);
            shift.checkout_window_end = string.IsNullOrEmpty(dto.checkout_window_end) ? null : TimeSpan.Parse(dto.checkout_window_end);
            shift.allowed_late_mins = dto.allowed_late_mins;
            shift.allowed_early_mins = dto.allowed_early_mins;
            shift.max_late_mins = dto.max_late_mins;
            shift.max_early_mins = dto.max_early_mins;
            shift.checkin_requirement = dto.checkin_requirement;
            shift.checkout_requirement = dto.checkout_requirement;
            shift.timezone = dto.timezone ?? "Asia/Saigon";
            shift.start_date = dto.start_date;
            shift.end_date = dto.end_date;
            shift.min_working_hours = dto.min_working_hours;
            shift.meal_type_id = dto.meal_type_id;
            shift.meal_count = dto.meal_count;
            shift.is_overtime_shift = dto.is_overtime_shift;

            _unitOfWork.Repository<Shifts>().Update(shift);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteOrDeactivateShiftAsync(int id)
        {
            var shift = await _unitOfWork.Repository<Shifts>().GetByIdAsync(id);
            if (shift == null) throw new Exception("Không tìm thấy ca làm việc");

            var hasAssignments = await _unitOfWork.Repository<ShiftAssignments>().AsQueryable()
                                     .AnyAsync(a => a.shift_id == id);
            
            if (hasAssignments)
            {
                shift.is_active = false;
                _unitOfWork.Repository<Shifts>().Update(shift);
            }
            else
            {
                _unitOfWork.Repository<Shifts>().Remove(shift);
            }

            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<byte[]> ExportShiftListAsync(string? search, TimeSpan? startTime, TimeSpan? endTime, bool? isActive)
        {
            var query = _unitOfWork.Repository<Shifts>().AsQueryable();

            if (isActive.HasValue) query = query.Where(s => s.is_active == isActive.Value);
            if (!string.IsNullOrEmpty(search)) query = query.Where(s => s.shift_name.Contains(search) || s.shift_code.Contains(search));
            if (startTime.HasValue && endTime.HasValue) query = query.Where(s => s.start_time >= startTime.Value && s.end_time <= endTime.Value);

            var shifts = await query.OrderBy(s => s.shift_code).ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("DanhSachCa");

            worksheet.Cell(1, 1).Value = "STT";
            worksheet.Cell(1, 2).Value = "Mã ca";
            worksheet.Cell(1, 3).Value = "Tên ca làm";
            worksheet.Cell(1, 4).Value = "Giờ vào";
            worksheet.Cell(1, 5).Value = "Giờ ra";
            worksheet.Cell(1, 6).Value = "Độ dài ca (Giờ)";
            worksheet.Cell(1, 7).Value = "Xuyên đêm";
            worksheet.Cell(1, 8).Value = "Trạng thái";

            var headerRow = worksheet.Row(1);
            headerRow.Style.Font.Bold = true;
            headerRow.Style.Fill.BackgroundColor = XLColor.LightBlue;

            for (int i = 0; i < shifts.Count; i++)
            {
                var s = shifts[i];
                var row = i + 2;

                var duration = s.is_overnight 
                    ? (decimal)(s.end_time.Add(TimeSpan.FromDays(1)) - s.start_time).TotalHours
                    : (decimal)(s.end_time - s.start_time).TotalHours;

                worksheet.Cell(row, 1).Value = i + 1;
                worksheet.Cell(row, 2).Value = s.shift_code;
                worksheet.Cell(row, 3).Value = s.shift_name;
                worksheet.Cell(row, 4).Value = s.start_time.ToString(@"hh\:mm");
                worksheet.Cell(row, 5).Value = s.end_time.ToString(@"hh\:mm");
                worksheet.Cell(row, 6).Value = duration;
                worksheet.Cell(row, 7).Value = s.is_overnight ? "Có" : "Không";
                worksheet.Cell(row, 8).Value = s.is_active ? "Hoạt động" : "Ngừng";
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new System.IO.MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }
}
