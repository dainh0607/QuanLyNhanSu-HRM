using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.Services.ControlPlane;
using ERP.DTOs.ControlPlane;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/super-admin")]
    [Authorize] // Phải kiểm tra role hoặc policies bên dưới
    public class ControlPlaneController : ControllerBase
    {
        private readonly ISuperAdminPortalService _portalService;

        public ControlPlaneController(ISuperAdminPortalService portalService)
        {
            _portalService = portalService;
        }

        // Fix theo yêu cầu Authorization: Check Role "System_Admin"
        [HttpGet("control-plane-snapshot")]
        [Authorize(Roles = "System_Admin")]
        public async Task<IActionResult> GetSnapshot()
        {
            var snapshot = await _portalService.GetControlPlaneSnapshotAsync();
            return Ok(snapshot);
        }

        [HttpPost("workspace-owners")]
        [Authorize(Roles = "System_Admin")]
        public async Task<IActionResult> CreateWorkspaceOwner([FromBody] WorkspaceOwnerCreateInputDto input)
        {
            var result = await _portalService.CreateWorkspaceOwnerAsync(input);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("workspace-owners/{id}/resend-invite")]
        [Authorize(Roles = "System_Admin")]
        public async Task<IActionResult> ResendInvite(string id)
        {
            var result = await _portalService.ResendWorkspaceOwnerInviteAsync(id);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("workspace-owners/{id}/revoke")]
        [Authorize(Roles = "System_Admin")]
        public async Task<IActionResult> RevokeInvite(string id)
        {
            var result = await _portalService.RevokeWorkspaceOwnerInviteAsync(id);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("support-grants/{ticketId}/activate")]
        [Authorize(Roles = "System_Admin")]
        public async Task<IActionResult> ActivateGrant(string ticketId)
        {
            var result = await _portalService.ActivateSupportGrantAsync(ticketId);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("support-grants/{ticketId}/revoke")]
        [Authorize(Roles = "System_Admin")]
        public async Task<IActionResult> RevokeGrant(string ticketId)
        {
            var result = await _portalService.RevokeSupportGrantAsync(ticketId);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}
