using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Entities.Models.ControlPlane;
using ERP.DTOs.ControlPlane;
using ERP.Entities.Interfaces;

namespace ERP.Services.ControlPlane
{
    public class SuperAdminPortalService : ISuperAdminPortalService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public SuperAdminPortalService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<int> GetTotalTenantsAsync()
        {
            return await _context.Tenants.IgnoreQueryFilters().CountAsync();
        }

        public async Task<int> GetActiveSubscriptionsAsync()
        {
            return await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .CountAsync(s => s.Status == "active");
        }

        public async Task<ControlPlaneSnapshotDto> GetControlPlaneSnapshotAsync()
        {
            var tenants = await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .Include(t => t.Plan)
                .Select(t => new TenantSubscriptionDto
                {
                    Id = t.Id.ToString(),
                    CompanyName = t.Tenant != null ? t.Tenant.name : "",
                    WorkspaceCode = t.Tenant != null ? t.Tenant.code : "",
                    SubscriptionCode = t.SubscriptionCode,
                    PlanCode = t.Plan != null ? t.Plan.Code : "",
                    PlanName = t.Plan != null ? t.Plan.Name : "",
                    SubscriptionStatus = t.Status,
                    OnboardingStatus = t.OnboardingStatus,
                    BillingCycle = t.BillingCycle,
                    NextRenewalAt = t.NextRenewalAt,
                    StorageLimitGb = t.Plan != null ? t.Plan.StorageLimitGb : 0,
                    StorageUsedGb = (int)t.StorageUsedGb,
                    BillingStatus = t.BillingStatus
                }).ToListAsync();

            var plans = await _context.SubscriptionPlans
                .IgnoreQueryFilters()
                .Select(p => new SubscriptionPlanDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    MaxEmployees = p.EmployeeSeatLimit,
                    StorageLimitGb = p.StorageLimitGb,
                    PriceMonthly = p.MonthlyPriceVnd,
                    PriceYearly = p.MonthlyPriceVnd * 12
                }).ToListAsync();

            var invoices = await _context.InvoiceMetadata
                .IgnoreQueryFilters()
                .Select(i => new InvoiceMetadataDto
                {
                    Id = i.Id,
                    InvoiceCode = i.InvoiceCode,
                    WorkspaceCode = i.WorkspaceCode,
                    Amount = i.AmountVnd,
                    Status = i.Status,
                    IssuedAt = i.IssuedAt,
                    DueAt = i.DueAt,
                    PaidAt = null
                }).ToListAsync();

            var supportGrants = await _context.SupportAccessGrants
                .IgnoreQueryFilters()
                .Select(s => new SupportGrantDto
                {
                    TicketId = s.TicketId,
                    WorkspaceCode = s.WorkspaceCode,
                    Status = s.Status,
                    RequestedAt = s.CreatedAt,
                    CustomerApprovedAt = s.CustomerApprovedAt,
                    ExpiresAt = s.ExpiresAt,
                    RequestedBy = "system"
                }).ToListAsync();

            var owners = await _context.WorkspaceOwnerInvitations
                .IgnoreQueryFilters()
                .Select(o => new WorkspaceOwnerProvisioningDto
                {
                    Id = o.Id.ToString(),
                    CompanyName = o.CompanyName,
                    WorkspaceCode = o.WorkspaceCode,
                    OwnerFullName = o.OwnerFullName,
                    OwnerEmail = o.OwnerEmail,
                    OwnerPhone = o.OwnerPhone,
                    PlanCode = o.TargetPlanCode,
                    BillingCycle = o.BillingCycle,
                    Status = o.Status,
                    InvitedAt = o.InvitedAt,
                    LastSentAt = o.LastSentAt,
                    ExpiresAt = o.ExpiresAt,
                    ActivatedAt = o.ActivatedAt,
                    InvitedBy = o.InvitedBy,
                    Note = o.Note,
                    ActivationToken = o.ActivationToken,
                    ActivationLink = $"https://admin-dashboard.nexahr.local/activate-workspace-owner?token={o.ActivationToken}"
                }).ToListAsync();

            return new ControlPlaneSnapshotDto
            {
                Tenants = tenants,
                Plans = plans,
                Invoices = invoices,
                SupportGrants = supportGrants,
                WorkspaceOwners = owners
            };
        }

        public async Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> CreateWorkspaceOwnerAsync(WorkspaceOwnerCreateInputDto input)
        {
            var codeUpper = input.WorkspaceCode.Trim().ToUpper();

            // Validate constraints
            if (await _context.Tenants.IgnoreQueryFilters().AnyAsync(t => t.code == codeUpper))
            {
                return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto> { Success = false, Message = "Workspace code already exists." };
            }

            if (await _context.WorkspaceOwnerInvitations.IgnoreQueryFilters().AnyAsync(o => o.WorkspaceCode == codeUpper || o.OwnerEmail == input.OwnerEmail))
            {
                return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto> { Success = false, Message = "Workspace owner email or workspace code is already being provisioned." };
            }

            var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Code == input.PlanCode);
            if (plan == null) return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto> { Success = false, Message = "Plan not found." };

            var token = $"owner-{codeUpper.ToLower()}-{Guid.NewGuid()}";
            var now = DateTime.UtcNow;

            var owner = new WorkspaceOwnerInvitation
            {
                CompanyName = input.CompanyName,
                WorkspaceCode = codeUpper,
                OwnerFullName = input.OwnerFullName,
                OwnerEmail = input.OwnerEmail,
                OwnerPhone = input.OwnerPhone,
                TargetPlanCode = plan.Code,
                BillingCycle = input.BillingCycle,
                Status = "invited",
                ActivationToken = token,
                InvitedBy = "system",
                Note = input.Note,
                InvitedAt = now,
                LastSentAt = now,
                ExpiresAt = now.AddDays(4)
            };

            await _context.WorkspaceOwnerInvitations.AddAsync(owner);

            // Mock creating initial Tenant records (Pending real activation)
            var tenant = new Tenants
            {
                name = input.CompanyName,
                code = codeUpper,
                is_active = true,
                CreatedAt = now
            };
            await _context.Tenants.AddAsync(tenant);
            await _context.SaveChangesAsync(); // save tenant to get Id

            var sub = new TenantSubscription
            {
                TenantId = tenant.Id,
                PlanId = plan.Id,
                SubscriptionCode = $"SUB-{codeUpper}-{now.Year}",
                Status = "trial",
                OnboardingStatus = "setup_in_progress",
                BillingCycle = input.BillingCycle,
                NextRenewalAt = now.AddDays(14), // 14 day trial
                BillingStatus = "draft",
                CreatedAt = now
            };
            await _context.TenantSubscriptions.AddAsync(sub);
            
            await _context.SaveChangesAsync();

            var snapshot = await GetControlPlaneSnapshotAsync();
            var dto = snapshot.WorkspaceOwners.FirstOrDefault(o => o.WorkspaceCode == codeUpper);

            return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto>
            {
                Success = true,
                Message = "Workspace owner invite created.",
                Snapshot = snapshot,
                Record = dto
            };
        }

        public async Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> ResendWorkspaceOwnerInviteAsync(string ownerId)
        {
            int id = int.Parse(ownerId);
            var owner = await _context.WorkspaceOwnerInvitations.FindAsync(id);
            if (owner == null) return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto> { Success = false, Message = "Invite not found." };
            if (owner.Status == "revoked") return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto> { Success = false, Message = "Invite revoked." };

            owner.LastSentAt = DateTime.UtcNow;
            owner.Status = "invited";
            await _context.SaveChangesAsync();

            var snapshot = await GetControlPlaneSnapshotAsync();
            return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto> { Success = true, Message = "Invite re-sent.", Snapshot = snapshot, Record = snapshot.WorkspaceOwners.First(o => o.Id == ownerId) };
        }

        public async Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> RevokeWorkspaceOwnerInviteAsync(string ownerId)
        {
            int id = int.Parse(ownerId);
            var owner = await _context.WorkspaceOwnerInvitations.FindAsync(id);
            if (owner == null) return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto> { Success = false, Message = "Invite not found." };

            owner.Status = "revoked";
            await _context.SaveChangesAsync();

            var snapshot = await GetControlPlaneSnapshotAsync();
            return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto> { Success = true, Message = "Invite revoked.", Snapshot = snapshot, Record = snapshot.WorkspaceOwners.First(o => o.Id == ownerId) };
        }

        public async Task<PortalMutationResultDto<SupportGrantDto>> ActivateSupportGrantAsync(string ticketId)
        {
            var grant = await _context.SupportAccessGrants.FirstOrDefaultAsync(g => g.TicketId == ticketId);
            if (grant == null) return new PortalMutationResultDto<SupportGrantDto> { Success = false, Message = "Support ticket not found." };
            if (grant.CustomerApprovedAt == null) return new PortalMutationResultDto<SupportGrantDto> { Success = false, Message = "Customer approval missing." };

            var expiresAt = grant.ExpiresAt ?? DateTime.UtcNow.AddHours(48);
            grant.Status = "granted";
            grant.ExpiresAt = expiresAt;

            await _context.SaveChangesAsync();
            var snapshot = await GetControlPlaneSnapshotAsync();
            
            return new PortalMutationResultDto<SupportGrantDto> { Success = true, Message = "Support access granted.", Snapshot = snapshot, Record = snapshot.SupportGrants.First(g => g.TicketId == ticketId) };
        }

        public async Task<PortalMutationResultDto<SupportGrantDto>> RevokeSupportGrantAsync(string ticketId)
        {
            var grant = await _context.SupportAccessGrants.FirstOrDefaultAsync(g => g.TicketId == ticketId);
            if (grant == null) return new PortalMutationResultDto<SupportGrantDto> { Success = false, Message = "Support ticket not found." };

            grant.Status = "revoked";
            grant.ExpiresAt = null;

            await _context.SaveChangesAsync();
            var snapshot = await GetControlPlaneSnapshotAsync();
            return new PortalMutationResultDto<SupportGrantDto> { Success = true, Message = "Support access revoked.", Snapshot = snapshot, Record = snapshot.SupportGrants.First(g => g.TicketId == ticketId) };
        }
    }
}
