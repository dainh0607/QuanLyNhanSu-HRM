using System;
using System.Threading.Tasks;
using ERP.DTOs.Tenant;
using ERP.Services.Tenant;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/tenant")]
    public class TenantSubscriptionController : ControllerBase
    {
        private readonly ITenantSubscriptionService _subscriptionService;

        public TenantSubscriptionController(ITenantSubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        [HttpGet("my-subscription")]
        public async Task<IActionResult> GetMySubscription()
        {
            try
            {
                var result = await _subscriptionService.GetMySubscriptionAsync();
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving subscription info.", error = ex.Message });
            }
        }

        [HttpPost("upgrade-request")]
        public async Task<IActionResult> CreateUpgradeRequest([FromBody] UpgradeRequestDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.TargetPlanCode))
                {
                    return BadRequest(new { message = "Target plan code is required." });
                }

                var result = await _subscriptionService.CreateUpgradeRequestAsync(dto);
                return Ok(new { success = true, message = "Upgrade request sent successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while sending upgrade request.", error = ex.Message });
            }
        }
    }
}
