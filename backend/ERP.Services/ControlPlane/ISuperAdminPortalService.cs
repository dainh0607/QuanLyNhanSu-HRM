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
        Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> CreateWorkspaceOwnerAsync(WorkspaceOwnerCreateInputDto input);
        Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> ResendWorkspaceOwnerInviteAsync(string ownerId);
        Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> RevokeWorkspaceOwnerInviteAsync(string ownerId);
        Task<PortalMutationResultDto<SupportGrantDto>> ActivateSupportGrantAsync(string ticketId);
        Task<PortalMutationResultDto<SupportGrantDto>> RevokeSupportGrantAsync(string ticketId);
    }
}
