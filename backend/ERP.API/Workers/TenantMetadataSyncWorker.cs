using ERP.Entities;
using ERP.Entities.Models.ControlPlane;
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
    public class TenantMetadataSyncWorker : BackgroundService
    {
        private readonly ILogger<TenantMetadataSyncWorker> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1);

        public TenantMetadataSyncWorker(ILogger<TenantMetadataSyncWorker> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Tenant Metadata Sync Worker is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Syncing tenant metadata at: {time}", DateTimeOffset.Now);

                try
                {
                    await SyncMetadataAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while syncing tenant metadata.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Tenant Metadata Sync Worker is stopping.");
        }

        private async Task SyncMetadataAsync()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Bypass Global Query Filters to see all tenants
                var tenants = await context.Tenants.AsNoTracking().ToListAsync();

                foreach (var tenant in tenants)
                {
                    try
                    {
                        // 1. Calculate Employee Count
                        var employeeCount = await context.Employees
                            .IgnoreQueryFilters()
                            .Where(e => e.tenant_id == tenant.Id)
                            .CountAsync();

                        // 2. Calculate Storage Usage
                        var storageUsageBytes = await context.EmployeeDocuments
                            .IgnoreQueryFilters()
                            .Where(d => d.tenant_id == tenant.Id)
                            .SumAsync(d => d.FileSize);

                        // 3. Get Subscription Info
                        var subscription = await context.TenantSubscriptions
                            .Include(s => s.Plan)
                            .FirstOrDefaultAsync(s => s.TenantId == tenant.Id);

                        // 4. Get Support Access Status
                        var supportGrant = await context.SupportAccessGrants
                            .OrderByDescending(g => g.CreatedAt)
                            .FirstOrDefaultAsync(g => g.TenantId == tenant.Id);

                        var supportStatus = "LOCKED";
                        if (supportGrant != null)
                        {
                            if (supportGrant.Status == "granted") supportStatus = "GRANTED";
                            else if (supportGrant.Status == "pending_customer_approval") supportStatus = "PENDING";
                        }

                        // 5. Update or Create Metadata
                        var metadata = await context.TenantMetadata
                            .FirstOrDefaultAsync(m => m.tenant_id == tenant.Id);

                        if (metadata == null)
                        {
                            metadata = new TenantMetadata
                            {
                                tenant_id = tenant.Id,
                                CreatedAt = DateTime.UtcNow
                            };
                            context.TenantMetadata.Add(metadata);
                        }

                        metadata.total_employees = employeeCount;
                        metadata.storage_usage_bytes = storageUsageBytes;
                        metadata.max_storage_quota_bytes = (long)(subscription?.Plan?.StorageLimitGb ?? 0) * 1024 * 1024 * 1024;
                        metadata.rental_status = subscription?.Status?.ToUpper() ?? "TRIAL";
                        metadata.subscription_plan_name = subscription?.Plan?.Name;
                        metadata.last_invoice_code = subscription?.LastInvoiceCode;
                        metadata.support_access_status = supportStatus;
                        metadata.last_sync_at = DateTime.UtcNow;
                        metadata.UpdatedAt = DateTime.UtcNow;

                        // Sync back to TenantSubscription for consistency if needed
                        if (subscription != null)
                        {
                            subscription.StorageUsedGb = (float)storageUsageBytes / (1024 * 1024 * 1024);
                            subscription.UpdatedAt = DateTime.UtcNow;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error syncing metadata for tenant {TenantId}", tenant.Id);
                    }
                }

                await context.SaveChangesAsync();
            }
        }
    }
}
