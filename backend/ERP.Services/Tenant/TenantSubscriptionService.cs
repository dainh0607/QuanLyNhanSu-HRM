using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using ERP.DTOs.Tenant;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models.ControlPlane;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Tenant
{
    public class TenantSubscriptionService : ITenantSubscriptionService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public TenantSubscriptionService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<TenantSubscriptionDto> GetMySubscriptionAsync()
        {
            var tenantId = _userContext.TenantId;
            if (!tenantId.HasValue)
            {
                throw new UnauthorizedAccessException("Tenant context is required.");
            }

            var subscription = await _context.TenantSubscriptions
                .Include(s => s.Plan)
                .FirstOrDefaultAsync(s => s.TenantId == tenantId.Value);

            if (subscription == null || subscription.Plan == null)
            {
                // Fallback or throw if no subscription found
                return new TenantSubscriptionDto
                {
                    PlanName = "Free / Trial",
                    Status = "active",
                    ActiveEmployees = await _context.Employees.CountAsync(e => e.is_active && !e.is_resigned),
                    EmployeeLimit = 5, // Default limit
                    StorageUsedGb = 0,
                    StorageLimitGb = 1
                };
            }

            // Real-time calculation of active employees
            int activeEmployees = await _context.Employees.CountAsync(e => e.is_active && !e.is_resigned);

            // Real-time calculation of storage usage (sum FileSize in bytes, convert to GB)
            long totalBytes = await _context.EmployeeDocuments.SumAsync(d => d.FileSize);
            double storageUsedGb = Math.Round(totalBytes / (1024.0 * 1024.0 * 1024.0), 4);

            var modules = subscription.Plan.Modules?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(m => m.Trim().ToLower())
                .ToList() ?? new List<string>();

            return new TenantSubscriptionDto
            {
                PlanName = subscription.Plan.Name,
                PlanCode = subscription.Plan.Code,
                Status = subscription.Status,
                BillingCycle = subscription.BillingCycle,
                NextRenewalAt = subscription.NextRenewalAt,
                ActiveEmployees = activeEmployees,
                EmployeeLimit = subscription.Plan.EmployeeSeatLimit,
                StorageUsedGb = storageUsedGb,
                StorageLimitGb = subscription.Plan.StorageLimitGb,
                IncludedModules = modules
            };
        }

        public async Task<bool> CreateUpgradeRequestAsync(UpgradeRequestDto dto)
        {
            var tenantId = _userContext.TenantId;
            if (!tenantId.HasValue)
            {
                throw new UnauthorizedAccessException("Tenant context is required.");
            }

            var request = new TenantUpgradeRequest
            {
                TenantId = tenantId.Value,
                TargetPlanCode = dto.TargetPlanCode,
                Note = dto.Note,
                Status = "Pending"
            };

            _context.TenantUpgradeRequests.Add(request);
            await _context.SaveChangesAsync();

            // Here you could trigger a notification/email to Super Admin
            // For now, we just save the request in the DB.

            return true;
        }
    }
}
