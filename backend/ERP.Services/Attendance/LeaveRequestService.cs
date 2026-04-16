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
    }
}
