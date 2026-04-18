using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.ControlPlane;

namespace ERP.Services.ControlPlane
{
    public interface ISuperAdminPortalService
    {
        Task<int> GetTotalTenantsAsync();
        Task<int> GetActiveSubscriptionsAsync();

        Task<ControlPlaneSnapshotDto> GetControlPlaneSnapshotAsync();
        Task<List<TenantSubscriptionDto>> GetTenantDirectoryAsync(string? search, string? subscriptionStatus);
        Task<List<SubscriptionPlanDto>> GetPlansCatalogAsync(string? search, string? status);
        Task<BillingListPageDto> GetBillingCatalogAsync(string? search, string? status, int page, int pageSize);
        Task<List<SupportGrantDto>> GetSupportTicketsAsync(string? search, string? status);

        Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> CreateWorkspaceOwnerAsync(WorkspaceOwnerCreateInputDto input);
        Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> ResendWorkspaceOwnerInviteAsync(string ownerId);
        Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> RevokeWorkspaceOwnerInviteAsync(string ownerId);

        Task<PortalMutationResultDto<SubscriptionPlanDto>> CreateSubscriptionPlanAsync(SubscriptionPlanInputDto input);
        Task<PortalMutationResultDto<SubscriptionPlanDto>> UpdateSubscriptionPlanAsync(string planId, SubscriptionPlanInputDto input);
        Task<PortalMutationResultDto<SubscriptionPlanDto>> DeleteSubscriptionPlanAsync(string planId);

        Task<PortalMutationResultDto<InvoiceMetadataDto>> MarkInvoicePaidAsync(string invoiceId, ManualPaymentInputDto input);
        Task<PortalMutationResultDto<InvoiceMetadataDto>> SendInvoiceReminderAsync(string invoiceId);
        Task<PortalMutationResultDto<InvoiceMetadataDto>> UpdateDraftInvoiceAsync(string invoiceId, DraftInvoiceUpdateInputDto input);
        Task<PortalMutationResultDto<InvoiceMetadataDto>> CancelDraftInvoiceAsync(string invoiceId);
        Task<PortalMutationResultDto<InvoiceMetadataDto>> ProcessPaymentGatewayWebhookAsync(PaymentGatewayWebhookInputDto input);
        Task<InvoicePdfFileResultDto?> GenerateInvoicePdfAsync(string invoiceId);

        Task<PortalMutationResultDto<SupportGrantDto>> CreateSupportTicketAsync(SupportTicketCreateInputDto input);
        Task<PortalMutationResultDto<SupportGrantDto>> ActivateSupportGrantAsync(string ticketId);
        Task<PortalMutationResultDto<SupportGrantDto>> RevokeSupportGrantAsync(string ticketId);
    }
}
