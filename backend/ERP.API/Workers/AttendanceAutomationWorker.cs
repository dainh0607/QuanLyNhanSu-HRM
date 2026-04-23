using ERP.Entities;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ERP.API.Workers
{
    public class AttendanceAutomationWorker : BackgroundService
    {
        private readonly ILogger<AttendanceAutomationWorker> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(30);

        public AttendanceAutomationWorker(ILogger<AttendanceAutomationWorker> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Attendance Automation Worker is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessAutoAttendanceAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred during auto attendance processing.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Attendance Automation Worker is stopping.");
        }

        private async Task ProcessAutoAttendanceAsync()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var now = DateTime.UtcNow.AddHours(7); // Vietnamese Time
                var today = now.Date;
                var currentTime = now.TimeOfDay;

                _logger.LogInformation("Processing auto attendance for {Date} at {Time}", today.ToShortDateString(), currentTime);

                // Lấy tất cả cài đặt có bật tự động
                var autoSettings = await context.AttendanceSettings
                    .Where(s => s.auto_attendance || s.auto_checkout)
                    .ToListAsync();

                foreach (var setting in autoSettings)
                {
                    // Lấy ca làm việc của nhân viên trong ngày hôm nay
                    var assignment = await context.ShiftAssignments
                        .Include(a => a.Shift)
                        .FirstOrDefaultAsync(a => a.employee_id == setting.employee_id 
                                             && a.assignment_date.Date == today 
                                             && a.status == "published");

                    if (assignment == null) continue;

                    var shift = assignment.Shift;

                    // 1. Tự động Check-in
                    if (setting.auto_attendance)
                    {
                        // Nếu đã qua giờ bắt đầu ca và chưa có bản ghi IN
                        if (currentTime >= shift.start_time)
                        {
                            var hasInRecord = await context.AttendanceRecords
                                .AnyAsync(r => r.employee_id == setting.employee_id 
                                          && r.record_time.Date == today 
                                          && r.record_type == "IN");

                            if (!hasInRecord)
                            {
                                var recordTime = today.Add(shift.start_time);
                                context.AttendanceRecords.Add(new AttendanceRecords
                                {
                                    employee_id = setting.employee_id,
                                    record_time = recordTime,
                                    record_type = "IN",
                                    source = "Auto",
                                    note = "Tự động vào ca theo cấu hình",
                                    verified = true,
                                    tenant_id = setting.tenant_id,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                });
                                _logger.LogInformation("Auto check-in for employee {Id} at {Time}", setting.employee_id, recordTime);
                            }
                        }
                    }

                    // 2. Tự động Check-out
                    if (setting.auto_checkout)
                    {
                        // Nếu đã qua giờ kết thúc ca và chưa có bản ghi OUT
                        if (currentTime >= shift.end_time)
                        {
                            var hasOutRecord = await context.AttendanceRecords
                                .AnyAsync(r => r.employee_id == setting.employee_id 
                                          && r.record_time.Date == today 
                                          && r.record_type == "OUT");

                            if (!hasOutRecord)
                            {
                                var recordTime = today.Add(shift.end_time);
                                context.AttendanceRecords.Add(new AttendanceRecords
                                {
                                    employee_id = setting.employee_id,
                                    record_time = recordTime,
                                    record_type = "OUT",
                                    source = "Auto",
                                    note = "Tự động ra ca theo cấu hình",
                                    verified = true,
                                    tenant_id = setting.tenant_id,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                });
                                _logger.LogInformation("Auto check-out for employee {Id} at {Time}", setting.employee_id, recordTime);
                            }
                        }
                    }
                }

                await context.SaveChangesAsync();
            }
        }
    }
}
