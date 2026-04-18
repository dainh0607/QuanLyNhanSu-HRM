using System;
using System.Threading.Tasks;
using ERP.DTOs.ControlPlane;
using ERP.Services.ControlPlane;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/activation")]
    public class WorkspaceActivationController : ControllerBase
    {
        private readonly IWorkspaceActivationService _activationService;

        public WorkspaceActivationController(IWorkspaceActivationService activationService)
        {
            _activationService = activationService;
        }

        /// <summary>
        /// Public endpoint - no authentication required.
        /// Workspace Owner uses activation link to fetch session info.
        /// </summary>
        [HttpGet("workspace-owner")]
        public async Task<IActionResult> FetchActivationSession([FromQuery] string token)
        {
            try
            {
                var result = await _activationService.FetchActivationSessionAsync(token);
                if (!result.Success)
                {
                    return result.Status == "not_found"
                        ? NotFound(result)
                        : BadRequest(result);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        /// <summary>
        /// Public endpoint - no authentication required.
        /// Workspace Owner sets password and activates account.
        /// </summary>
        [HttpPost("workspace-owner")]
        public async Task<IActionResult> ActivateWorkspaceOwner([FromBody] WorkspaceActivationPayloadDto payload)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _activationService.ActivateWorkspaceOwnerAsync(payload);
                if (!result.Success)
                {
                    return BadRequest(result);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }
    }
}
