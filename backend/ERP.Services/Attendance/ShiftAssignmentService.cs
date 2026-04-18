using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Attendance
{
    public class ShiftAssignmentService : IShiftAssignmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IShiftNotificationService _notificationService;

        public ShiftAssignmentService(IUnitOfWork unitOfWork, IShiftNotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
        }

        public async Task<WeeklyScheduleApiResponseDto> GetWeeklyScheduleAsync(
            string weekStartDate, 
            int? branchId, 
            int? departmentId, 
            string? searchTerm,
            int? regionId = null,
            int? jobTitleId = null,
            int? accessGroupId = null,
            string? genderCode = null,
            string? employeeStatus = "active")
        {
            if (!DateTime.TryParse(weekStartDate, out var startDate))
                throw new Exception("Ngày bắt đầu tuần không hợp lệ.");

            var endDate = startDate.AddDays(7);

            // 1. Fetch Employees
            IQueryable<Entities.Models.Employees> employeeQuery = _unitOfWork.Repository<Entities.Models.Employees>()
                .AsQueryable()
                .Include(e => e.Branch)
                .Include(e => e.Department)
                .Include(e => e.JobTitle);

            if (employeeStatus == "active")
                employeeQuery = employeeQuery.Where(e => e.is_active);

            if (branchId.HasValue)
                employeeQuery = employeeQuery.Where(e => e.branch_id == branchId.Value);
            
            if (departmentId.HasValue)
                employeeQuery = employeeQuery.Where(e => e.department_id == departmentId.Value);

            if (regionId.HasValue)
                employeeQuery = employeeQuery.Where(e => e.region_id == regionId.Value);

            if (jobTitleId.HasValue)
                employeeQuery = employeeQuery.Where(e => e.job_title_id == jobTitleId.Value);

            if (!string.IsNullOrEmpty(genderCode))
                employeeQuery = employeeQuery.Where(e => e.gender_code == genderCode);

            if (!string.IsNullOrEmpty(searchTerm))
                employeeQuery = employeeQuery.Where(e => e.full_name.Contains(searchTerm) || e.employee_code.Contains(searchTerm));

            var employees = await employeeQuery.ToListAsync();
            var employeeIdsList = employees.Select(e => e.Id).ToList();

            // 2. Fetch Assignments
            var assignments = await _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Include(a => a.Shift)
                .Include(a => a.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(a => a.Employee)
                    .ThenInclude(e => e.JobTitle)
                .Where(a => employeeIdsList.Contains(a.employee_id) && a.assignment_date >= startDate && a.assignment_date < endDate)
                .ToListAsync();

            // 3. Fetch Open Shifts
            var openShiftQuery = _unitOfWork.Repository<OpenShifts>()
                .AsQueryable()
                .Include(o => o.Shift)
                .Include(o => o.Branch)
                .Include(o => o.JobTitle)
                .Where(o => o.open_date >= startDate && o.open_date < endDate);

            if (branchId.HasValue)
                openShiftQuery = openShiftQuery.Where(o => o.branch_id == branchId.Value);

            var openShifts = await openShiftQuery.ToListAsync();

            // 4. Transform to DTOs
            var assignmentDtos = assignments.Select(a => new WeeklyScheduleApiAssignmentDto
            {
                Id = a.Id,
                EmployeeId = a.employee_id,
                EmployeeName = a.Employee?.full_name,
                EmployeeCode = a.Employee?.employee_code,
                EmployeeAvatar = a.Employee?.avatar,
                ShiftId = a.shift_id,
                ShiftName = a.Shift?.shift_name,
                StartTime = a.Shift?.start_time.ToString(@"hh\:mm"),
                EndTime = a.Shift?.end_time.ToString(@"hh\:mm"),
                AssignmentDate = a.assignment_date.ToString("yyyy-MM-dd"),
                IsPublished = a.is_published,
                Status = a.status ?? (a.is_published ? "approved" : "draft"),
                Note = a.note,
                BranchId = a.Employee?.branch_id,
                BranchName = a.Employee?.Branch?.name,
                JobTitleId = a.Employee?.job_title_id,
                JobTitleName = a.Employee?.JobTitle?.name
            }).ToList();

            return new WeeklyScheduleApiResponseDto
            {
                WeekStartDate = weekStartDate,
                Employees = employees.Select(e => new WeeklyScheduleApiEmployeeDto
                {
                    Id = e.Id,
                    FullName = e.full_name,
                    Avatar = e.avatar,
                    EmployeeCode = e.employee_code,
                    BranchId = e.branch_id,
                    BranchName = e.Branch?.name,
                    DepartmentId = e.department_id,
                    DepartmentName = e.Department?.name,
                    JobTitleId = e.job_title_id,
                    JobTitleName = e.JobTitle?.name,
                    IsActive = e.is_active
                }).ToList(),
                Assignments = assignmentDtos,
                OpenShifts = openShifts.Select(o => new WeeklyScheduleApiOpenShiftDto
                {
                    Id = o.Id,
                    ShiftId = o.shift_id,
                    ShiftName = o.Shift?.shift_name,
                    StartTime = o.Shift?.start_time.ToString(@"hh\:mm"),
                    EndTime = o.Shift?.end_time.ToString(@"hh\:mm"),
                    OpenDate = o.open_date.ToString("yyyy-MM-dd"),
                    Status = o.status,
                    RequiredQuantity = o.required_quantity,
                    AssignedQuantity = 0,
                    BranchId = o.branch_id,
                    BranchName = o.Branch?.name,
                    DepartmentId = o.department_id,
                    JobTitleId = o.job_title_id,
                    JobTitleName = o.JobTitle?.name
                }).ToList(),
                DraftCount = assignmentDtos.Count(a => a.Status == "draft"),
                PublishedCount = assignmentDtos.Count(a => a.Status == "published"),
                ApprovedCount = assignmentDtos.Count(a => a.Status == "approved"),
                LastUpdatedAt = DateTime.UtcNow
            };
        }

        public async Task<int> CreateAssignmentAsync(ShiftAssignmentCreateDto dto)
        {
            var assignment = new ShiftAssignments
            {
                employee_id = dto.employee_id,
                shift_id = dto.shift_id,
                assignment_date = dto.assignment_date.Date,
                note = dto.note,
                is_published = false,
                status = "draft",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<ShiftAssignments>().AddAsync(assignment);
            await _unitOfWork.SaveChangesAsync();
            return assignment.Id;
        }

        public async Task<bool> DeleteAssignmentByIdAsync(int id)
        {
            var assignment = await _unitOfWork.Repository<ShiftAssignments>().GetByIdAsync(id);
            if (assignment == null) return false;

            _unitOfWork.Repository<ShiftAssignments>().Remove(assignment);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> RefreshAttendanceAsync(int assignmentId)
        {
            var assignment = await _unitOfWork.Repository<ShiftAssignments>().GetByIdAsync(assignmentId);
            if (assignment == null) return false;

            assignment.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Repository<ShiftAssignments>().Update(assignment);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        private (DateTime startDate, DateTime endDate) ParseWeekRange(string weekStartDate)
        {
            if (!DateTime.TryParse(weekStartDate, out var startDate))
                throw new Exception("Ngày bắt đầu tuần không hợp lệ.");
            return (startDate, startDate.AddDays(7));
        }

        private static List<int> NormalizeIds(List<int>? values) =>
            (values ?? new List<int>())
                .Where(value => value > 0)
                .Distinct()
                .ToList();

        private static DateTime ParseDate(string value, string label)
        {
            if (!DateTime.TryParse(value, out var parsedDate))
                throw new Exception($"{label} khĂ´ng há»£p lá»‡.");

            return parsedDate.Date;
        }

        private static string BuildSlotKey(int employeeId, DateTime date) =>
            $"{employeeId}:{date:yyyy-MM-dd}";

        private static string BuildAssignmentKey(int employeeId, int shiftId, DateTime date) =>
            $"{employeeId}:{shiftId}:{date:yyyy-MM-dd}";

        public async Task<ShiftBulkActionResultDto> PublishAssignmentsAsync(string weekStartDate, List<int>? assignmentIds)
        {
            var (startDate, endDate) = ParseWeekRange(weekStartDate);

            var query = _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Where(a => a.assignment_date >= startDate && a.assignment_date < endDate && a.status == "draft");

            if (assignmentIds != null && assignmentIds.Count > 0)
                query = query.Where(a => assignmentIds.Contains(a.Id));

            var assignments = await query.ToListAsync();
            foreach (var a in assignments)
            {
                a.status = "published";
                a.is_published = true;
                a.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Repository<ShiftAssignments>().Update(a);
            }

            await _unitOfWork.SaveChangesAsync();

            // Gửi thông báo
            await _notificationService.NotifyShiftPublishedAsync(assignments.Select(a => a.Id).ToList());

            return new ShiftBulkActionResultDto
            {
                AffectedCount = assignments.Count,
                Message = $"Đã công bố {assignments.Count} ca làm việc."
            };
        }

        public async Task<ShiftBulkActionResultDto> ApproveAssignmentsAsync(string weekStartDate, List<int>? assignmentIds)
        {
            var (startDate, endDate) = ParseWeekRange(weekStartDate);

            var query = _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Where(a => a.assignment_date >= startDate && a.assignment_date < endDate && a.status == "published");

            if (assignmentIds != null && assignmentIds.Count > 0)
                query = query.Where(a => assignmentIds.Contains(a.Id));

            var assignments = await query.ToListAsync();
            foreach (var a in assignments)
            {
                a.status = "approved";
                a.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Repository<ShiftAssignments>().Update(a);
            }

            await _unitOfWork.SaveChangesAsync();

            // Gửi thông báo
            await _notificationService.NotifyShiftApprovedAsync(assignments.Select(a => a.Id).ToList());

            return new ShiftBulkActionResultDto
            {
                AffectedCount = assignments.Count,
                Message = $"Đã chấp thuận {assignments.Count} ca làm việc."
            };
        }

        public async Task<ShiftBulkActionResultDto> PublishAndApproveAssignmentsAsync(string weekStartDate, List<int>? assignmentIds)
        {
            var (startDate, endDate) = ParseWeekRange(weekStartDate);

            var query = _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Where(a => a.assignment_date >= startDate && a.assignment_date < endDate && (a.status == "draft" || a.status == "published"));

            if (assignmentIds != null && assignmentIds.Count > 0)
                query = query.Where(a => assignmentIds.Contains(a.Id));

            var assignments = await query.ToListAsync();
            foreach (var a in assignments)
            {
                a.status = "approved";
                a.is_published = true;
                a.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Repository<ShiftAssignments>().Update(a);
            }

            await _unitOfWork.SaveChangesAsync();

            // Gửi thông báo
            await _notificationService.NotifyShiftApprovedAsync(assignments.Select(a => a.Id).ToList());

            return new ShiftBulkActionResultDto
            {
                AffectedCount = assignments.Count,
                Message = $"Đã công bố & chấp thuận {assignments.Count} ca làm việc."
            };
        }

        public async Task<ShiftBulkActionResultDto> DeleteUnconfirmedAssignmentsAsync(string weekStartDate)
        {
            var (startDate, endDate) = ParseWeekRange(weekStartDate);

            var assignments = await _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Where(a => a.assignment_date >= startDate && a.assignment_date < endDate && a.status != "approved")
                .ToListAsync();

            foreach (var a in assignments)
                _unitOfWork.Repository<ShiftAssignments>().Remove(a);

            await _unitOfWork.SaveChangesAsync();
            return new ShiftBulkActionResultDto
            {
                AffectedCount = assignments.Count,
                Message = $"Đã xóa {assignments.Count} ca làm chưa xác nhận."
            };
        }

        public async Task<ShiftAssignmentCopyResultDto> CopyAssignmentsAsync(ShiftAssignmentCopyDto dto, int currentUserId)
        {
            if (dto.TargetWeekStartDates == null || dto.TargetWeekStartDates.Count == 0)
                throw new Exception("Danh sáº¡ch tuáº§n Ä‘Ă­ch khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.");

            var sourceWeekStartDate = ParseDate(dto.SourceWeekStartDate, "Tuáº§n nguá»“n");
            var targetWeekStartDates = dto.TargetWeekStartDates
                .Select(value => ParseDate(value, "Tuáº§n Ä‘Ă­ch"))
                .Where(value => value != sourceWeekStartDate)
                .Distinct()
                .OrderBy(value => value)
                .ToList();

            if (targetWeekStartDates.Count == 0)
                throw new Exception("KhĂ´ng cĂ³ tuáº§n Ä‘Ă­ch há»£p lá»‡ Ä‘á»ƒ sao chĂ©p.");

            var branchIds = NormalizeIds(dto.BranchIds);
            var departmentIds = NormalizeIds(dto.DepartmentIds);
            var employeeIds = NormalizeIds(dto.EmployeeIds);
            var assignmentIds = NormalizeIds(dto.AssignmentIds);
            var mergeMode = (dto.MergeMode ?? "merge").Trim().ToLowerInvariant();

            var sourceWeekEndDate = sourceWeekStartDate.AddDays(7);

            var sourceQuery = _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Include(assignment => assignment.Employee)
                .Where(assignment => assignment.assignment_date >= sourceWeekStartDate && assignment.assignment_date < sourceWeekEndDate);

            if (assignmentIds.Count > 0)
                sourceQuery = sourceQuery.Where(assignment => assignmentIds.Contains(assignment.Id));

            if (employeeIds.Count > 0)
                sourceQuery = sourceQuery.Where(assignment => employeeIds.Contains(assignment.employee_id));

            if (branchIds.Count > 0)
                sourceQuery = sourceQuery.Where(assignment => assignment.Employee != null && assignment.Employee.branch_id.HasValue && branchIds.Contains(assignment.Employee.branch_id.Value));

            if (departmentIds.Count > 0)
                sourceQuery = sourceQuery.Where(assignment => assignment.Employee != null && assignment.Employee.department_id.HasValue && departmentIds.Contains(assignment.Employee.department_id.Value));

            var sourceAssignments = await sourceQuery
                .OrderBy(assignment => assignment.assignment_date)
                .ThenBy(assignment => assignment.employee_id)
                .ThenBy(assignment => assignment.shift_id)
                .ToListAsync();

            if (sourceAssignments.Count == 0)
            {
                return new ShiftAssignmentCopyResultDto();
            }

            var sourceEmployeeIds = sourceAssignments
                .Select(assignment => assignment.employee_id)
                .Distinct()
                .ToList();

            var targetRangeStartDate = targetWeekStartDates.Min();
            var targetRangeEndDate = targetWeekStartDates.Max().AddDays(7);

            var existingTargetAssignments = await _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Where(assignment =>
                    sourceEmployeeIds.Contains(assignment.employee_id) &&
                    assignment.assignment_date >= targetRangeStartDate &&
                    assignment.assignment_date < targetRangeEndDate)
                .ToListAsync();

            List<ShiftAssignments> assignmentsToRemove = new List<ShiftAssignments>();
            if (mergeMode == "overwrite")
            {
                var overwriteSlotKeys = new HashSet<string>(
                    targetWeekStartDates.SelectMany(targetWeekStartDate =>
                        sourceAssignments.Select(sourceAssignment =>
                            BuildSlotKey(
                                sourceAssignment.employee_id,
                                targetWeekStartDate.AddDays((sourceAssignment.assignment_date.Date - sourceWeekStartDate).Days)))),
                    StringComparer.OrdinalIgnoreCase);

                assignmentsToRemove = existingTargetAssignments
                    .Where(assignment => overwriteSlotKeys.Contains(BuildSlotKey(assignment.employee_id, assignment.assignment_date.Date)))
                    .ToList();

                if (assignmentsToRemove.Count > 0)
                {
                    existingTargetAssignments = existingTargetAssignments
                        .Except(assignmentsToRemove)
                        .ToList();
                }
            }

            var existingAssignmentKeys = new HashSet<string>(
                existingTargetAssignments.Select(assignment => BuildAssignmentKey(assignment.employee_id, assignment.shift_id, assignment.assignment_date.Date)),
                StringComparer.OrdinalIgnoreCase);

            var assignmentsToCreate = new List<ShiftAssignments>();
            var copiedCount = 0;
            var skippedCount = 0;
            var now = DateTime.UtcNow;

            foreach (var targetWeekStartDate in targetWeekStartDates)
            {
                foreach (var sourceAssignment in sourceAssignments)
                {
                    var targetAssignmentDate = targetWeekStartDate.AddDays((sourceAssignment.assignment_date.Date - sourceWeekStartDate).Days);
                    var assignmentKey = BuildAssignmentKey(sourceAssignment.employee_id, sourceAssignment.shift_id, targetAssignmentDate);

                    if (mergeMode != "overwrite" && existingAssignmentKeys.Contains(assignmentKey))
                    {
                        skippedCount += 1;
                        continue;
                    }

                    assignmentsToCreate.Add(new ShiftAssignments
                    {
                        employee_id = sourceAssignment.employee_id,
                        shift_id = sourceAssignment.shift_id,
                        assignment_date = targetAssignmentDate,
                        note = sourceAssignment.note,
                        is_published = false,
                        status = "draft",
                        created_by = currentUserId > 0 ? currentUserId : sourceAssignment.created_by,
                        CreatedAt = now,
                        UpdatedAt = now
                    });

                    existingAssignmentKeys.Add(assignmentKey);
                    copiedCount += 1;
                }
            }

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                if (mergeMode == "overwrite" && assignmentsToRemove != null && assignmentsToRemove.Count > 0)
                {
                    _unitOfWork.Repository<ShiftAssignments>().RemoveRange(assignmentsToRemove);
                }

                if (assignmentsToCreate.Count > 0)
                {
                    await _unitOfWork.Repository<ShiftAssignments>().AddRangeAsync(assignmentsToCreate);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception("Lỗi khi sao chép ca hàng loạt: " + ex.Message);
            }

            return new ShiftAssignmentCopyResultDto
            {
                CopiedCount = copiedCount,
                SkippedCount = skippedCount
            };
        }

        public async Task<IEnumerable<ShiftWeekItemDto>> GetWeeksListAsync(int? year)
        {
            var targetYear = year ?? DateTime.Now.Year;
            var weeks = new List<ShiftWeekItemDto>();

            // Calculate start of year and the first Monday
            var startOfYear = new DateTime(targetYear, 1, 1);
            var daysToMonday = ((int)DayOfWeek.Monday - (int)startOfYear.DayOfWeek + 7) % 7;
            if (startOfYear.DayOfWeek != DayOfWeek.Monday)
            {
                // ISO 8601 week 1 can start in the previous year
                // We'll just simple approach: Find first Monday of course
                // But generally, let's just find the first Monday near 1/1
            }
            // A simpler, accurate ISO week approach
            var currentDay = new DateTime(targetYear, 1, 1);
            if (currentDay.DayOfWeek != DayOfWeek.Monday)
            {
                var diff = (7 + (currentDay.DayOfWeek - DayOfWeek.Monday)) % 7;
                currentDay = currentDay.AddDays(-diff);
            }

            // Move through the year
            int weekNumber = 1;
            var today = DateTime.Now.Date;

            while (currentDay.Year <= targetYear || weekNumber <= 52)
            {
                // Generate week
                var endDay = currentDay.AddDays(6);
                var isCurrent = today >= currentDay && today <= endDay;
                var isPast = endDay < today;
                var isFuture = currentDay > today;

                weeks.Add(new ShiftWeekItemDto
                {
                    WeekNumber = weekNumber,
                    Year = targetYear,
                    WeekLabel = $"Tuần {weekNumber}-{targetYear}",
                    StartDate = currentDay.ToString("yyyy-MM-dd"),
                    EndDate = endDay.ToString("yyyy-MM-dd"),
                    IsCurrent = isCurrent,
                    IsPast = isPast,
                    IsFuture = isFuture
                });

                currentDay = currentDay.AddDays(7);
                weekNumber++;
                
                // Break if we've crossed into next year significantly and done 52 weeks
                // Some years have 53 weeks.
                if (weekNumber > 53 && currentDay.Year > targetYear) break;
            }

            return await Task.FromResult(weeks);
        }

        public async Task<ShiftAssignmentCopyPreviewResultDto> PreviewCopyAssignmentsAsync(ShiftAssignmentCopyPreviewDto dto)
        {
            var sourceWeekStartDate = ParseDate(dto.SourceWeekStartDate, "Tuần nguồn");
            var sourceWeekEndDate = sourceWeekStartDate.AddDays(7);

            var branchIds = NormalizeIds(dto.BranchIds);
            var departmentIds = NormalizeIds(dto.DepartmentIds);

            var sourceQuery = _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Include(assignment => assignment.Employee)
                .Where(assignment => assignment.assignment_date >= sourceWeekStartDate && assignment.assignment_date < sourceWeekEndDate);

            if (branchIds.Count > 0)
                sourceQuery = sourceQuery.Where(assignment => assignment.Employee != null && assignment.Employee.branch_id.HasValue && branchIds.Contains(assignment.Employee.branch_id.Value));

            if (departmentIds.Count > 0)
                sourceQuery = sourceQuery.Where(assignment => assignment.Employee != null && assignment.Employee.department_id.HasValue && departmentIds.Contains(assignment.Employee.department_id.Value));

            var count = await sourceQuery.CountAsync();
            var distinctEmployees = await sourceQuery.Select(a => a.employee_id).Distinct().CountAsync();

            return new ShiftAssignmentCopyPreviewResultDto
            {
                HasData = count > 0,
                TotalShifts = count,
                TotalEmployees = distinctEmployees
            };
        }


        public async Task<ShiftCountersDto> GetShiftCountersAsync(string startDateStr, string endDateStr, int? branchId = null)
        {
            if (!DateTime.TryParse(startDateStr, out var startDate) || !DateTime.TryParse(endDateStr, out var endDate))
                throw new Exception("Ngày tháng không hợp lệ.");

            var query = _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Where(a => a.assignment_date >= startDate && a.assignment_date <= endDate);

            if (branchId.HasValue)
            {
                query = query.Include(a => a.Employee).Where(a => a.Employee != null && a.Employee.branch_id == branchId.Value);
            }

            var draftCount = await query.CountAsync(a => a.status == "draft");
            var pendingApprovalCount = await query.CountAsync(a => a.status == "published");

            return new ShiftCountersDto
            {
                PendingPublishCount = draftCount,
                PendingApprovalCount = pendingApprovalCount
            };
        }

        public async Task<ShiftBulkActionResultDto> UpdateShiftStatusAsync(ShiftBulkUpdateStatusDto dto)
        {
            if (string.IsNullOrEmpty(dto.TargetStatus))
                throw new Exception("Trạng thái đích không được để trống.");

            var (startDate, endDate) = ParseWeekRange(dto.WeekStartDate);

            var query = _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Where(a => a.assignment_date >= startDate && a.assignment_date < endDate);

            if (dto.AssignmentIds != null && dto.AssignmentIds.Count > 0)
                query = query.Where(a => dto.AssignmentIds.Contains(a.Id));
            else
            {
                // Nếu không truyền ID, mặc định là các ca có trạng thái hợp lệ để chuyển đổi
                if (dto.TargetStatus == "published")
                    query = query.Where(a => a.status == "draft");
                else if (dto.TargetStatus == "approved")
                    query = query.Where(a => a.status == "published" || a.status == "draft");
            }

            var assignments = await query.ToListAsync();
            foreach (var a in assignments)
            {
                a.status = dto.TargetStatus;
                if (dto.TargetStatus == "published") a.is_published = true;
                if (dto.TargetStatus == "approved") a.is_published = true;
                
                a.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Repository<ShiftAssignments>().Update(a);
            }

            await _unitOfWork.SaveChangesAsync();

            var ids = assignments.Select(a => a.Id).ToList();
            if (dto.TargetStatus == "published")
                await _notificationService.NotifyShiftPublishedAsync(ids);
            else if (dto.TargetStatus == "approved")
                await _notificationService.NotifyShiftApprovedAsync(ids);

            return new ShiftBulkActionResultDto
            {
                AffectedCount = assignments.Count,
                Message = $"Đã cập nhật {assignments.Count} ca làm sang trạng thái '{dto.TargetStatus}'."
            };
        }

        // Manage Assignments via Shift Tabs Modal (T223 - T225)
        public async Task<IEnumerable<ShiftTabDto>> GetShiftTabsAsync(int branchId)
        {
            var query = _unitOfWork.Repository<Shifts>().AsQueryable().Where(s => s.is_active);
            var activeShifts = await query.ToListAsync();
            
            return activeShifts.Select(s => new ShiftTabDto 
            {
                ShiftId = s.Id,
                ShiftCode = s.shift_code,
                ShiftName = s.shift_name,
                StartTime = s.start_time.ToString(@"hh\:mm"),
                EndTime = s.end_time.ToString(@"hh\:mm")
            }).ToList();
        }

        public async Task<IEnumerable<DayAssignedUsersDto>> GetAssignedUsersByShiftAndWeekAsync(int shiftId, DateTime weekStartDate, int branchId)
        {
            var weekEndDate = weekStartDate.AddDays(6).Date;
            var result = new List<DayAssignedUsersDto>();

            var assignments = await _unitOfWork.Repository<ShiftAssignments>().AsQueryable()
                .Include(a => a.Employee)
                .Where(a => a.shift_id == shiftId && 
                            a.assignment_date.Date >= weekStartDate.Date && 
                            a.assignment_date.Date <= weekEndDate &&
                            a.Employee.branch_id == branchId)
                .ToListAsync();

            var currentLang = System.Globalization.CultureInfo.GetCultureInfo("vi-VN");
            
            for (int i = 0; i < 7; i++)
            {
                var currentDate = weekStartDate.AddDays(i).Date;
                var dailyAssignments = assignments.Where(a => a.assignment_date.Date == currentDate).ToList();
                
                var dayDto = new DayAssignedUsersDto
                {
                    Date = currentDate.ToString("yyyy-MM-dd"),
                    DayOfWeek = currentLang.DateTimeFormat.GetDayName(currentDate.DayOfWeek),
                    Users = dailyAssignments.Select(a => new ShiftUserDto
                    {
                        AssignmentId = a.Id,
                        EmployeeId = a.employee_id,
                        FullName = a.Employee?.full_name ?? "N/A",
                        Avatar = a.Employee?.avatar,
                        Phone = string.IsNullOrEmpty(a.Employee?.phone) ? a.Employee?.work_email : a.Employee?.phone
                    }).ToList()
                };
                result.Add(dayDto);
            }

            return result;
        }

        public async Task<IEnumerable<ShiftAvailableUserDto>> GetAvailableUsersAsync(int branchId, int shiftId, DateTime date)
        {
            var employeesQuery = _unitOfWork.Repository<Entities.Models.Employees>().AsQueryable()
                .Include(e => e.JobTitle)
                .Where(e => e.branch_id == branchId && e.is_active && !e.is_resigned);

            var alreadyAssignedIds = await _unitOfWork.Repository<ShiftAssignments>().AsQueryable()
                .Where(a => a.shift_id == shiftId && a.assignment_date.Date == date.Date)
                .Select(a => a.employee_id)
                .ToListAsync();

            var availableEmployees = await employeesQuery
                .Where(e => !alreadyAssignedIds.Contains(e.Id))
                .OrderBy(e => e.employee_code)
                .ToListAsync();

            return availableEmployees.Select(e => new ShiftAvailableUserDto
            {
                EmployeeId = e.Id,
                EmployeeCode = e.employee_code,
                FullName = e.full_name ?? string.Empty,
                Avatar = e.avatar,
                JobTitle = e.JobTitle?.name
            });
        }

        public async Task<bool> BulkCreateAssignmentsAsync(BulkShiftAssignmentCreateDto dto)
        {
            if (dto.employee_ids == null || !dto.employee_ids.Any()) return false;

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var assignmentsToInsert = new List<ShiftAssignments>();
                
                var existingAssignedIds = await _unitOfWork.Repository<ShiftAssignments>().AsQueryable()
                    .Where(a => a.shift_id == dto.shift_id && a.assignment_date.Date == dto.assignment_date.Date && dto.employee_ids.Contains(a.employee_id))
                    .Select(a => a.employee_id)
                    .ToListAsync();

                foreach (var empId in dto.employee_ids)
                {
                    if (!existingAssignedIds.Contains(empId))
                    {
                        assignmentsToInsert.Add(new ShiftAssignments
                        {
                            employee_id = empId,
                            shift_id = dto.shift_id,
                            assignment_date = dto.assignment_date.Date,
                            is_published = false,
                            note = dto.note,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }

                if (assignmentsToInsert.Any())
                {
                    await _unitOfWork.Repository<ShiftAssignments>().AddRangeAsync(assignmentsToInsert);
                    await _unitOfWork.SaveChangesAsync();
                }

                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception("Lỗi khi gán ca hàng loạt: " + ex.Message);
            }
        }
    }
}
