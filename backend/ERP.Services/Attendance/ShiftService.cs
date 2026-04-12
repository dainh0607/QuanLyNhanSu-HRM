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
    public class ShiftService : IShiftService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ShiftService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<WeeklyShiftScheduleDto> GetWeeklyScheduleAsync(int branchId, DateTime startDate)
        {
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
                    Verified = r.verified
                }).ToList()
            };
        }

        public async Task<bool> DeleteShiftAssignmentAsync(int employeeId, DateTime date)
        {
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
                    color = dto.Color,
                    shift_type_id = dto.ShiftTypeId,
                    is_active = true,
                    note = dto.Note
                };

                await _unitOfWork.Repository<Shifts>().AddAsync(shift);
                await _unitOfWork.SaveChangesAsync();

                // 2. Optional Assignment (T201)
                if (dto.AssignToUserId.HasValue && dto.AssignDate.HasValue)
                {
                    var user = await _unitOfWork.Repository<Users>().GetByIdAsync(dto.AssignToUserId.Value);
                    if (user == null) throw new Exception($"Không tìm thấy người dùng ID {dto.AssignToUserId.Value}");

                    var assignment = new ShiftAssignments
                    {
                        employee_id = user.employee_id,
                        shift_id = shift.Id,
                        assignment_date = dto.AssignDate.Value,
                        is_published = true,
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

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                foreach (var bid in dto.BranchIds)
                {
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
                                note = dto.Note,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };

                            await _unitOfWork.Repository<OpenShifts>().AddAsync(openShift);
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
    }
}
