using System;
using System.Collections.Generic;

namespace ERP.DTOs.ControlPlane
{
    public class ControlPlaneSnapshotDto
    {
        public List<TenantSubscriptionDto> Tenants { get; set; } = new();
        public List<SubscriptionPlanDto> Plans { get; set; } = new();
        public List<InvoiceMetadataDto> Invoices { get; set; } = new();
        public List<SupportGrantDto> SupportGrants { get; set; } = new();
        public List<WorkspaceOwnerProvisioningDto> WorkspaceOwners { get; set; } = new();
    }

    public class PortalMutationResultDto<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public ControlPlaneSnapshotDto Snapshot { get; set; }
        public T Record { get; set; }
    }

    public class WorkspaceOwnerCreateInputDto
    {
        public string CompanyName { get; set; }
        public string WorkspaceCode { get; set; }
        public string OwnerFullName { get; set; }
        public string OwnerEmail { get; set; }
        public string OwnerPhone { get; set; }
        public string PlanCode { get; set; }
        public string BillingCycle { get; set; }
        public string Note { get; set; }
    }

    public class WorkspaceOwnerProvisioningDto
    {
        public string Id { get; set; }
        public string CompanyName { get; set; }
        public string WorkspaceCode { get; set; }
        public string OwnerFullName { get; set; }
        public string OwnerEmail { get; set; }
        public string OwnerPhone { get; set; }
        public string PlanCode { get; set; }
        public string PlanName { get; set; }
        public string BillingCycle { get; set; }
        public string Status { get; set; }
        public DateTime InvitedAt { get; set; }
        public DateTime LastSentAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? ActivatedAt { get; set; }
        public string InvitedBy { get; set; }
        public string Note { get; set; }
        public string ActivationToken { get; set; }
        public string ActivationLink { get; set; }
        public string AdminDashboardUrl { get; set; }
        public string SecurityBoundary { get; set; } = "owner-sets-password";
    }

    public class TenantSubscriptionDto
    {
        public string Id { get; set; }
        public string CompanyName { get; set; }
        public string WorkspaceCode { get; set; }
        public string SubscriptionCode { get; set; }
        public string PlanCode { get; set; }
        public string PlanName { get; set; }
        public string SubscriptionStatus { get; set; }
        public string OnboardingStatus { get; set; }
        public string BillingCycle { get; set; }
        public DateTime? NextRenewalAt { get; set; }
        public string PortalAdminEmail { get; set; }
        public int StorageLimitGb { get; set; }
        public int StorageUsedGb { get; set; }
        public int AdminSeats { get; set; }
        public int ActiveEmployees { get; set; }
        public string LastInvoiceCode { get; set; }
        public string BillingStatus { get; set; }
        public string WorkspaceIsolationMode { get; set; }
        public string SupportAccessStatus { get; set; }
        public DateTime? SupportAccessExpiresAt { get; set; }
        public string SupportTicketId { get; set; }
    }

    public class SubscriptionPlanDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int MaxEmployees { get; set; }
        public int StorageLimitGb { get; set; }
        public decimal PriceMonthly { get; set; }
        public decimal PriceYearly { get; set; }
        public List<string> Features { get; set; } = new();
    }

    public class InvoiceMetadataDto
    {
        public int Id { get; set; }
        public string InvoiceCode { get; set; }
        public string WorkspaceCode { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
        public DateTime IssuedAt { get; set; }
        public DateTime DueAt { get; set; }
        public DateTime? PaidAt { get; set; }
    }

    public class SupportGrantDto
    {
        public int Id { get; set; }
        public string TicketId { get; set; }
        public string WorkspaceCode { get; set; }
        public string Status { get; set; }
        public string RequestedBy { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? CustomerApprovedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string SupportReason { get; set; }
        public string RequiredAccessLevel { get; set; }
    }
}
