using System.Threading.Tasks;
using ERP.DTOs.ControlPlane;

namespace ERP.Services.ControlPlane
{
    public interface IWorkspaceActivationService
    {
        Task<WorkspaceActivationResultDto> FetchActivationSessionAsync(string token);
        Task<WorkspaceActivationResultDto> ActivateWorkspaceOwnerAsync(WorkspaceActivationPayloadDto payload);
    }
}
