using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Attendance;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERP.Services.Attendance
{
    public class LeaveRequestService : ILeaveRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<LeaveRequestService> _logger;

        public LeaveRequestService(IUnitOfWork unitOfWork, ILogger<LeaveRequestService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<PaginatedListDto<LeaveRequestDto>> GetLeaveRequestsAsync(string? status, int skip, int take)
        {
            var query = _unitOfWork.Repository<LeaveRequests>()
                .AsQueryable()
                .Include(l => l.Employee)
                .Include(l => l.LeaveType)
                .AsNoTracking();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(l => l.status == status);
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip(skip)
                .Take(take)
                .Select(l => new LeaveRequestDto
                {
                    Id = l.Id,
                    EmployeeId = l.employee_id,
                    EmployeeName = l.Employee.full_name,
                    LeaveTypeId = l.leave_type_id,
                    LeaveTypeName = l.LeaveType.name,
                    StartDate = l.start_date,
                    EndDate = l.end_date,
                    Reason = l.reason,
                    Status = l.status,
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            return new PaginatedListDto<LeaveRequestDto>(items, total, skip / take + 1, take);
        }

        public async Task<LeaveRequestDto?> GetLeaveRequestByIdAsync(int id)
        {
            var l = await _unitOfWork.Repository<LeaveRequests>()
                .AsQueryable()
                .Include(l => l.Employee)
                .Include(l => l.LeaveType)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (l == null) return null;

            return new LeaveRequestDto
            {
                Id = l.Id,
                EmployeeId = l.employee_id,
                EmployeeName = l.Employee.full_name,
                LeaveTypeId = l.leave_type_id,
                LeaveTypeName = l.LeaveType.name,
                StartDate = l.start_date,
                EndDate = l.end_date,
                Reason = l.reason,
                Status = l.status,
                CreatedAt = l.CreatedAt
            };
        }

        public async Task<bool> CreateLeaveRequestAsync(LeaveRequestCreateDto dto)
        {
            // Simplified logic: mapping leave_type name to id if needed, 
            // but for this implementation we assume frontend knows IDs or we pick a default.
            var leaveType = await _unitOfWork.Repository<LeaveTypes>()
                .AsQueryable()
                .FirstOrDefaultAsync(t => t.name.Contains(dto.leave_type) || t.Id == 1);

            var leaveRequest = new LeaveRequests
            {
                employee_id = dto.employee_id,
                leave_type_id = leaveType?.Id ?? 1,
                start_date = dto.leave_date,
                end_date = dto.leave_date, // Simple 1 day leave
                reason = dto.note ?? $"Nghỉ {dto.leave_type}",
                status = "PENDING",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<LeaveRequests>().AddAsync(leaveRequest);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<LeaveRequestDependentDataDto> GetDependentDataAsync(int branchId, int excludeEmployeeId)
        {
            var leaveTypes = await _unitOfWork.Repository<LeaveTypes>()
                .AsQueryable()
                .Select(lt => new LeaveTypeSimpleDto
                {
                    Id = lt.Id,
                    Name = lt.name,
                    IsPaidLeave = lt.is_paid
                })
                .ToListAsync();

            var employees = await _unitOfWork.Repository<ERP.Entities.Models.Employees>()
                .AsQueryable()
                .Where(e => e.branch_id == branchId && e.Id != excludeEmployeeId && e.is_active && !e.is_resigned)
                .Select(e => new EmployeeSimpleDto
                {
                    Id = e.Id,
                    FullName = e.full_name,
                    Code = e.employee_code,
                    JobTitle = e.JobTitle != null ? e.JobTitle.name : null
                })
                .ToListAsync();

            return new LeaveRequestDependentDataDto
            {
                LeaveTypes = leaveTypes,
                HandoverEmployees = employees
            };
        }

        public async Task<bool> CreateMatrixLeaveRequestAsync(LeaveRequestCreateMatrixDto dto, int creatorId)
        {
            var shift = await _unitOfWork.Repository<Shifts>().GetByIdAsync(dto.shift_id);
            if (shift == null) throw new Exception("Không tìm thấy ca làm việc chỉ định.");
            
            var req = new LeaveRequests
            {
                employee_id = dto.employee_id,
                leave_type_id = dto.leave_type_id,
                start_shift_id = dto.shift_id,
                end_shift_id = dto.shift_id,
                reason = dto.reason,
                handover_employee_id = dto.handover_employee_id,
                handover_phone = dto.handover_phone,
                handover_note = dto.handover_note,
                status = "APPROVED",
                approved_by = creatorId,
                approved_at = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var shiftDurationHours = shift.is_overnight 
                ? (decimal)((shift.end_time.Add(TimeSpan.FromDays(1))) - shift.start_time).TotalHours
                : (decimal)(shift.end_time - shift.start_time).TotalHours;

            if (dto.leave_type_duration == "HOURLY")
            {
                if (string.IsNullOrEmpty(dto.start_time) || string.IsNullOrEmpty(dto.end_time))
                    throw new Exception("Vui lòng chỉ định thời gian 'Từ giờ' và 'Đến giờ'.");

                if (!TimeSpan.TryParse(dto.start_time, out var startTime) || !TimeSpan.TryParse(dto.end_time, out var endTime))
                    throw new Exception("Định dạng thời gian không hợp lệ.");

                var normalizedShiftEnd = shift.is_overnight ? shift.end_time.Add(TimeSpan.FromDays(1)) : shift.end_time;
                var normalizedEndTime = shift.is_overnight && endTime <= shift.end_time ? endTime.Add(TimeSpan.FromDays(1)) : endTime;
                var normalizedStartTime = shift.is_overnight && startTime <= shift.end_time && startTime < endTime ? startTime.Add(TimeSpan.FromDays(1)) : startTime;

                if (normalizedStartTime >= normalizedEndTime)
                    throw new Exception("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");

                if (normalizedStartTime < shift.start_time || normalizedEndTime > normalizedShiftEnd)
                    throw new Exception("Khung giờ nghỉ không nằm trong thời gian ca làm việc.");

                req.start_date = dto.leave_date.Date.Add(startTime);
                req.end_date = dto.leave_date.Date.Add(endTime);
                req.number_of_hours = (decimal)(normalizedEndTime - normalizedStartTime).TotalHours;
                
                var durType = await _unitOfWork.Repository<LeaveDurationTypes>().AsQueryable().FirstOrDefaultAsync(d => d.code == "HOURLY");
                req.duration_type_id = durType?.Id;
            }
            else
            {
                req.start_date = dto.leave_date.Date.Add(shift.start_time);
                req.end_date = dto.leave_date.Date.Add(shift.end_time);

                decimal requestedHours = dto.leave_type_duration switch
                {
                    "FULL" => shiftDurationHours,
                    "HALF" => shiftDurationHours / 2,
                    "QUARTER" => shiftDurationHours / 4,
                    "THREE_QUARTERS" => shiftDurationHours * 0.75m,
                    _ => shiftDurationHours
                };

                req.number_of_hours = requestedHours;
                
                var durType = await _unitOfWork.Repository<LeaveDurationTypes>().AsQueryable().FirstOrDefaultAsync(d => d.code == dto.leave_type_duration);
                req.duration_type_id = durType?.Id;
            }

            await _unitOfWork.Repository<LeaveRequests>().AddAsync(req);
            
            var leaveType = await _unitOfWork.Repository<LeaveTypes>().GetByIdAsync(dto.leave_type_id);
            if (leaveType != null && leaveType.is_paid)
            {
                var requestedDays = req.number_of_hours.Value / 8m;
                var balance = await _unitOfWork.Repository<EmployeeLeaves>()
                    .AsQueryable()
                    .FirstOrDefaultAsync(b => b.employee_id == req.employee_id && b.leave_type_id == req.leave_type_id);

                if (balance != null)
                {
                    balance.used_days += requestedDays;
                    _unitOfWork.Repository<EmployeeLeaves>().Update(balance);
                }
            }

            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> ApproveLeaveRequestAsync(int id, int managerId)
        {
            var leaveRequest = await _unitOfWork.Repository<LeaveRequests>().GetByIdAsync(id);
            if (leaveRequest == null) throw new Exception("Không tìm thấy yêu cầu nghỉ phép.");
            if (leaveRequest.status != "PENDING") throw new Exception("Yêu cầu đã được xử lý trước đó.");

            var days = (decimal)(leaveRequest.end_date - leaveRequest.start_date).TotalDays + 1;

            // Kiểm tra và trừ số dư phép
            var balance = await _unitOfWork.Repository<EmployeeLeaves>()
                .AsQueryable()
                .FirstOrDefaultAsync(b => b.employee_id == leaveRequest.employee_id && b.leave_type_id == leaveRequest.leave_type_id);

            if (balance != null)
            {
                if (balance.remaining_days < days) throw new Exception("Số ngày phép còn lại không đủ.");
                balance.used_days += days;
                _unitOfWork.Repository<EmployeeLeaves>().Update(balance);
            }

            leaveRequest.status = "APPROVED";
            leaveRequest.approved_by = managerId;
            leaveRequest.approved_at = DateTime.UtcNow;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<LeaveRequests>().Update(leaveRequest);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> RejectLeaveRequestAsync(int id, int managerId, string reason)
        {
            var leaveRequest = await _unitOfWork.Repository<LeaveRequests>().GetByIdAsync(id);
            if (leaveRequest == null) throw new Exception("Không tìm thấy yêu cầu nghỉ phép.");
            if (leaveRequest.status != "PENDING") throw new Exception("Yêu cầu đã được xử lý trước đó.");

            leaveRequest.status = "REJECTED";
            leaveRequest.reason = $"[Từ chối] {reason}. " + leaveRequest.reason;
            leaveRequest.approved_by = managerId;
            leaveRequest.approved_at = DateTime.UtcNow;
            leaveRequest.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<LeaveRequests>().Update(leaveRequest);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<LeaveBalanceDto>> GetLeaveBalanceAsync(int employeeId)
        {
            var balances = await _unitOfWork.Repository<EmployeeLeaves>()
                .AsQueryable()
                .Include(b => b.LeaveType)
                .Where(b => b.employee_id == employeeId)
                .ToListAsync();

            return balances.Select(b => new LeaveBalanceDto
            {
                EmployeeId = b.employee_id,
                LeaveTypeId = b.leave_type_id,
                LeaveTypeName = b.LeaveType?.name ?? "N/A",
                TotalDays = b.total_days,
                UsedDays = b.used_days,
                RemainingDays = b.remaining_days ?? (b.total_days - b.used_days)
            });
        }

        public async Task<EmployeeLeaveStatsDto> GetLeaveStatisticsAsync(int employeeId, int year)
        {
            // 1. Get all leave types to ensure we have names and is_paid info
            var leaveTypes = await _unitOfWork.Repository<LeaveTypes>().AsQueryable().ToListAsync();
            
            // 2. Get entitlements for the year
            var entitlements = await _unitOfWork.Repository<EmployeeLeaves>()
                .AsQueryable()
                .Where(e => e.employee_id == employeeId && e.year == year)
                .ToListAsync();

            // 3. Get all approved requests for the year
            var approvedRequests = await _unitOfWork.Repository<LeaveRequests>()
                .AsQueryable()
                .Where(r => r.employee_id == employeeId && r.status == "APPROVED" && r.start_date.Year == year)
                .ToListAsync();

            // 4. Aggregate used days per type
            // Calculation logic: number_of_hours / 8 or (end_date - start_date).TotalDays + 1
            var usedDaysByType = approvedRequests
                .GroupBy(r => r.leave_type_id)
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(r => r.number_of_hours.HasValue 
                        ? r.number_of_hours.Value / 8m 
                        : (decimal)((r.end_date.Date - r.start_date.Date).TotalDays + 1))
                );

            var stats = new EmployeeLeaveStatsDto();
            decimal totalPaidUsed = 0;
            decimal totalUnpaidUsed = 0;

            foreach (var type in leaveTypes)
            {
                var entitlement = entitlements.FirstOrDefault(e => e.leave_type_id == type.Id);
                var used = usedDaysByType.ContainsKey(type.Id) ? usedDaysByType[type.Id] : 0;
                
                var total = entitlement?.total_days ?? 0;
                
                // If there is no entitlement AND no used days, we skip it for the "Details" table 
                // UNLESS it's a primary leave type. For simplicity, we add all types that have either total or used > 0.
                if (total > 0 || used > 0)
                {
                    stats.Details.Add(new LeaveTypeStatDto
                    {
                        LeaveTypeId = type.Id,
                        LeaveTypeName = type.name,
                        TotalDays = total,
                        UsedDays = used,
                        RemainingDays = Math.Max(0, total - used)
                    });
                }

                // Add to summary
                if (type.is_paid)
                    totalPaidUsed += used;
                else
                    totalUnpaidUsed += used;
            }

            stats.Summary = new LeaveSummaryDto
            {
                PaidUsedDays = totalPaidUsed,
                UnpaidUsedDays = totalUnpaidUsed
            };

            return stats;
        }
    }
}
