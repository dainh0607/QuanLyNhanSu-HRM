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
        public string Message { get; set; } = string.Empty;
        public ControlPlaneSnapshotDto Snapshot { get; set; } = new();
        public T Record { get; set; } = default!;
    }

    public class WorkspaceOwnerCreateInputDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string WorkspaceCode { get; set; } = string.Empty;
        public string OwnerFullName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
        public string OwnerPhone { get; set; } = string.Empty;
        public string PlanCode { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = "monthly";
        public string? Note { get; set; }
    }

    public class WorkspaceOwnerProvisioningDto
    {
        public string Id { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string WorkspaceCode { get; set; } = string.Empty;
        public string OwnerFullName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
        public string OwnerPhone { get; set; } = string.Empty;
        public string PlanCode { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = "monthly";
        public string Status { get; set; } = "invited";
        public DateTime InvitedAt { get; set; }
        public DateTime LastSentAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? ActivatedAt { get; set; }
        public string InvitedBy { get; set; } = string.Empty;
        public string? Note { get; set; }
        public string ActivationToken { get; set; } = string.Empty;
        public string ActivationLink { get; set; } = string.Empty;
        public string AdminDashboardUrl { get; set; } = string.Empty;
        public string SecurityBoundary { get; set; } = "owner-sets-password";
    }

    public class TenantSubscriptionDto
    {
        public string Id { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string WorkspaceCode { get; set; } = string.Empty;
        public string SubscriptionCode { get; set; } = string.Empty;
        public string PlanCode { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public string SubscriptionStatus { get; set; } = "trial";
        public string OnboardingStatus { get; set; } = "setup_in_progress";
        public string BillingCycle { get; set; } = "monthly";
        public DateTime? NextRenewalAt { get; set; }
        public string PortalAdminEmail { get; set; } = string.Empty;
        public int StorageLimitGb { get; set; }
        public int StorageUsedGb { get; set; }
        public int AdminSeats { get; set; }
        public int ActiveEmployees { get; set; }
        public string LastInvoiceCode { get; set; } = string.Empty;
        public string BillingStatus { get; set; } = "draft";
        public string WorkspaceIsolationMode { get; set; } = "ticket-only-support";
        public string SupportAccessStatus { get; set; } = "not_requested";
        public DateTime? SupportAccessExpiresAt { get; set; }
        public string? SupportTicketId { get; set; }
    }

    public class SubscriptionPlanDto
    {
        public string Id { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "active";
        public decimal MonthlyPriceVnd { get; set; }
        public int StorageLimitGb { get; set; }
        public int AdminSeatLimit { get; set; }
        public int EmployeeSeatLimit { get; set; }
        public string SupportSla { get; set; } = string.Empty;
        public List<string> Modules { get; set; } = new();
        public string? Highlight { get; set; }
    }

    public class SubscriptionPlanInputDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "active";
        public decimal MonthlyPriceVnd { get; set; }
        public int StorageLimitGb { get; set; }
        public int AdminSeatLimit { get; set; }
        public int EmployeeSeatLimit { get; set; }
        public string SupportSla { get; set; } = string.Empty;
        public List<string> Modules { get; set; } = new();
        public string? Highlight { get; set; }
    }

    public class InvoiceMetadataDto
    {
        public string Id { get; set; } = string.Empty;
        public string InvoiceCode { get; set; } = string.Empty;
        public string TenantId { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string WorkspaceCode { get; set; } = string.Empty;
        public string TenantOwnerEmail { get; set; } = string.Empty;
        public string PlanCode { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = "monthly";
        public string BillingPeriodLabel { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; }
        public DateTime DueAt { get; set; }
        public DateTime AutoGeneratedAt { get; set; }
        public int DraftLeadDays { get; set; }
        public decimal AmountVnd { get; set; }
        public decimal BaseAmountVnd { get; set; }
        public decimal DiscountVnd { get; set; }
        public decimal AdditionalSeatFeeVnd { get; set; }
        public string Status { get; set; } = "draft";
        public string? PaymentGatewayRef { get; set; }
        public string? PaymentSource { get; set; }
        public DateTime? EmailSentAt { get; set; }
        public DateTime? ReminderSentAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public int GracePeriodDays { get; set; }
        public DateTime? GraceEndsAt { get; set; }
        public string PdfFileName { get; set; } = string.Empty;
        public string SummaryNote { get; set; } = string.Empty;
        public string MetadataScope { get; set; } = "service-metadata-only";
    }

    public class BillingListPageDto
    {
        public List<InvoiceMetadataDto> Items { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class ManualPaymentInputDto
    {
        public string PaymentGatewayRef { get; set; } = string.Empty;
        public string ReceivedAt { get; set; } = string.Empty;
    }

    public class DraftInvoiceUpdateInputDto
    {
        public decimal DiscountVnd { get; set; }
        public decimal AdditionalSeatFeeVnd { get; set; }
        public string SummaryNote { get; set; } = string.Empty;
        public string DueAt { get; set; } = string.Empty;
    }

    public class PaymentGatewayWebhookInputDto
    {
        public string? InvoiceId { get; set; }
        public string? InvoiceCode { get; set; }
        public string PaymentGatewayRef { get; set; } = string.Empty;
        public string PaidAt { get; set; } = string.Empty;
        public string Source { get; set; } = "gateway";
    }

    public class SupportGrantDto
    {
        public string TicketId { get; set; } = string.Empty;
        public string TenantId { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string WorkspaceCode { get; set; } = string.Empty;
        public string TenantOwnerEmail { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
        public string RequestedBy { get; set; } = string.Empty;
        public int RequestedDurationHours { get; set; }
        public string RequestedScope { get; set; } = string.Empty;
        public DateTime? CustomerApprovedAt { get; set; }
        public string? ApprovedByCustomerContact { get; set; }
        public string Status { get; set; } = "not_requested";
        public DateTime? ExpiresAt { get; set; }
        public DateTime? ActivatedAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public DateTime? LastNotifiedAt { get; set; }
        public string Note { get; set; } = string.Empty;
        public string? ImpersonationToken { get; set; }
        public string? SessionLaunchUrl { get; set; }
        public string AuditActorLabel { get; set; } = string.Empty;
    }

    public class SupportTicketCreateInputDto
    {
        public string TenantId { get; set; } = string.Empty;
        public int DurationHours { get; set; }
        public string RequestedScope { get; set; } = string.Empty;
        public string? RequestedBy { get; set; }
        public string? RequestedByEmail { get; set; }
    }

    public class InvoicePdfFileResultDto
    {
        public string FileName { get; set; } = string.Empty;
        public byte[] Content { get; set; } = Array.Empty<byte>();
    }
}
