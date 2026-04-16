using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using ERP.Services.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERP.Services.Attendance
{
    public class ShiftNotificationService : IShiftNotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly ILogger<ShiftNotificationService> _logger;

        public ShiftNotificationService(
            IUnitOfWork unitOfWork, 
            IEmailService emailService,
            ILogger<ShiftNotificationService> logger)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task NotifyShiftPublishedAsync(List<int> assignmentIds)
        {
            if (assignmentIds == null || !assignmentIds.Any()) return;

            var assignments = await _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Include(a => a.Employee)
                .Include(a => a.Shift)
                .Where(a => assignmentIds.Contains(a.Id))
                .ToListAsync();

            foreach (var assignment in assignments)
            {
                if (assignment.Employee != null && !string.IsNullOrEmpty(assignment.Employee.email))
                {
                    var subject = "[NexaHR] Thông báo ca làm việc mới";
                    var body = $@"
                        <h3>Chào {assignment.Employee.full_name},</h3>
                        <p>Một ca làm việc mới đã được công bố cho bạn:</p>
                        <ul>
                            <li><b>Ngày:</b> {assignment.assignment_date:dd/MM/yyyy}</li>
                            <li><b>Ca:</b> {assignment.Shift?.shift_name} ({assignment.Shift?.start_time:hh\:mm} - {assignment.Shift?.end_time:hh\:mm})</li>
                        </ul>
                        <p>Vui lòng kiểm tra ứng dụng để biết thêm chi tiết.</p>
                        <p>Trân trọng,<br/>Đội ngũ NexaHR</p>";

                    try 
                    {
                        await _emailService.SendEmailAsync(assignment.Employee.email, subject, body);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi gửi email thông báo công bố ca cho nhân viên {0}", assignment.employee_id);
                    }
                }
                
                // Placeholder cho thông báo Push/App
                _logger.LogInformation("Gửi thông báo Push: Ca làm việc ngày {0} đã được công bố cho nhân viên {1}", 
                    assignment.assignment_date.ToShortDateString(), assignment.employee_id);
            }
        }

        public async Task NotifyShiftApprovedAsync(List<int> assignmentIds)
        {
            if (assignmentIds == null || !assignmentIds.Any()) return;

            var assignments = await _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Include(a => a.Employee)
                .Include(a => a.Shift)
                .Where(a => assignmentIds.Contains(a.Id))
                .ToListAsync();

            foreach (var assignment in assignments)
            {
                if (assignment.Employee != null && !string.IsNullOrEmpty(assignment.Employee.email))
                {
                    var subject = "[NexaHR] Lịch làm việc chính thức";
                    var body = $@"
                        <h3>Chào {assignment.Employee.full_name},</h3>
                        <p>Ca làm việc của bạn vào ngày <b>{assignment.assignment_date:dd/MM/yyyy}</b> đã được <b>Xác nhận chính thức</b>.</p>
                        <p>Vui lòng có mặt đúng giờ để thực hiện chấm công.</p>
                        <p>Trân trọng,<br/>Đội ngũ NexaHR</p>";

                    try 
                    {
                        await _emailService.SendEmailAsync(assignment.Employee.email, subject, body);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi gửi email thông báo xác nhận ca cho nhân viên {0}", assignment.employee_id);
                    }
                }

                // Placeholder cho thông báo Push/App
                _logger.LogInformation("Gửi thông báo Push: Lịch làm việc ngày {0} đã được xác nhận chính thức cho nhân viên {1}", 
                    assignment.assignment_date.ToShortDateString(), assignment.employee_id);
            }
        }
    }
}
