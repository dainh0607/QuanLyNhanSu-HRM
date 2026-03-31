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
    public class EmployeeStatusWorker : BackgroundService
    {
        private readonly ILogger<EmployeeStatusWorker> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(24);

        public EmployeeStatusWorker(ILogger<EmployeeStatusWorker> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Employee Status Worker is starting.");

            // Run once at startup, then every 24 hours
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Employee Status Worker is checking for updates at: {time}", DateTimeOffset.Now);

                try
                {
                    await UpdateEmployeeStatusesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while updating employee statuses.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Employee Status Worker is stopping.");
        }

        private async Task UpdateEmployeeStatusesAsync()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var today = DateTime.Today;

                // 1. Activate employees who reach their start date
                var toActivate = await context.Employees
                    .Where(e => !e.is_active && !e.is_resigned && e.start_date != null && e.start_date <= today)
                    .ToListAsync();

                foreach (var emp in toActivate)
                {
                    emp.is_active = true;
                    emp.UpdatedAt = DateTime.UtcNow;
                    
                    _logger.LogInformation("Automatically activated employee: {code} - {name}", emp.employee_code, emp.full_name);
                    
                    // Log to UpdateHistory
                    context.UpdateHistory.Add(new UpdateHistory
                    {
                        table_name = "Employees",
                        record_id = emp.Id,
                        action = "AUTO_ACTIVATE",
                        change_time = DateTime.UtcNow,
                        old_values = "is_active: false",
                        new_values = "is_active: true"
                    });
                }

                // 2. Deactivate employees whose contracts have expired
                var toDeactivate = await context.Employees
                    .Where(e => e.is_active && !e.is_resigned && e.contract_expiry_date != null && e.contract_expiry_date < today)
                    .ToListAsync();

                foreach (var emp in toDeactivate)
                {
                    emp.is_active = false;
                    emp.UpdatedAt = DateTime.UtcNow;

                    _logger.LogWarning("Automatically deactivated employee due to contract expiry: {code} - {name}", emp.employee_code, emp.full_name);

                    // Log to UpdateHistory
                    context.UpdateHistory.Add(new UpdateHistory
                    {
                        table_name = "Employees",
                        record_id = emp.Id,
                        action = "AUTO_EXPIRE",
                        change_time = DateTime.UtcNow,
                        old_values = "is_active: true",
                        new_values = "is_active: false"
                    });
                }

                if (toActivate.Any() || toDeactivate.Any())
                {
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
