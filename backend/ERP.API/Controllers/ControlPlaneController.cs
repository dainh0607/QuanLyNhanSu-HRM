using System.Threading.Tasks;
using ERP.DTOs.ControlPlane;
using ERP.Services.ControlPlane;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/super-admin/control-plane")]
    [Authorize(Policy = ERP.DTOs.Auth.AuthSecurityConstants.SuperAdminPolicyName)]
    public class ControlPlaneController : ControllerBase
    {
        private readonly ISuperAdminPortalService _portalService;

        public ControlPlaneController(ISuperAdminPortalService portalService)
        {
            _portalService = portalService;
        }

        [HttpGet("snapshot")]
        [HttpGet("~/api/super-admin/control-plane-snapshot")]
        public async Task<IActionResult> GetSnapshot()
        {
            var snapshot = await _portalService.GetControlPlaneSnapshotAsync();
            return Ok(snapshot);
        }

        [HttpGet("tenants")]
        public async Task<IActionResult> GetTenants(
            [FromQuery] string? search,
            [FromQuery] string? subscriptionStatus)
        {
            var tenants = await _portalService.GetTenantDirectoryAsync(search, subscriptionStatus);
            return Ok(tenants);
        }

        [HttpGet("plans")]
        public async Task<IActionResult> GetPlans(
            [FromQuery] string? search,
            [FromQuery] string? status)
        {
            var plans = await _portalService.GetPlansCatalogAsync(search, status);
            return Ok(plans);
        }

        [HttpGet("plans/{id}")]
        public async Task<IActionResult> GetPlanDetail(string id)
        {
            var plan = await _portalService.GetSubscriptionPlanAsync(id);
            if (plan == null)
            {
                return NotFound(new { message = "Subscription plan not found." });
            }
            return Ok(plan);
        }

        [HttpGet("available-modules")]
        public async Task<IActionResult> GetAvailableModules()
        {
            var modules = await _portalService.GetAvailableModulesAsync();
            return Ok(modules);
        }

        [HttpPost("plans")]
        public async Task<IActionResult> CreatePlan([FromBody] SubscriptionPlanInputDto input)
        {
            var result = await _portalService.CreateSubscriptionPlanAsync(input);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPut("plans/{id}")]
        public async Task<IActionResult> UpdatePlan(string id, [FromBody] SubscriptionPlanInputDto input)
        {
            var result = await _portalService.UpdateSubscriptionPlanAsync(id, input);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpDelete("plans/{id}")]
        public async Task<IActionResult> DeletePlan(string id)
        {
            var result = await _portalService.DeleteSubscriptionPlanAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("invoices")]
        public async Task<IActionResult> GetInvoices(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 4)
        {
            var invoices = await _portalService.GetBillingCatalogAsync(search, status, page, pageSize);
            return Ok(invoices);
        }

        [HttpPut("invoices/{id}/mark-paid")]
        public async Task<IActionResult> MarkInvoicePaid(string id, [FromBody] ManualPaymentInputDto input)
        {
            var result = await _portalService.MarkInvoicePaidAsync(id, input);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("invoices/{id}/send-reminder")]
        public async Task<IActionResult> SendInvoiceReminder(string id)
        {
            var result = await _portalService.SendInvoiceReminderAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPut("invoices/{id}")]
        public async Task<IActionResult> UpdateDraftInvoice(string id, [FromBody] DraftInvoiceUpdateInputDto input)
        {
            var result = await _portalService.UpdateDraftInvoiceAsync(id, input);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("invoices/{id}/cancel")]
        public async Task<IActionResult> CancelDraftInvoice(string id)
        {
            var result = await _portalService.CancelDraftInvoiceAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("invoices/{id}/pdf")]
        public async Task<IActionResult> DownloadInvoicePdf(string id)
        {
            var pdfFile = await _portalService.GenerateInvoicePdfAsync(id);
            if (pdfFile == null)
            {
                return NotFound(new { message = "Invoice not found." });
            }

            return File(pdfFile.Content, "application/pdf", pdfFile.FileName);
        }

        [HttpPost("invoices/payment-webhooks")]
        public async Task<IActionResult> ProcessPaymentWebhook([FromBody] PaymentGatewayWebhookInputDto input)
        {
            var result = await _portalService.ProcessPaymentGatewayWebhookAsync(input);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("workspace-owners")]
        [HttpPost("~/api/super-admin/workspace-owners")]
        public async Task<IActionResult> CreateWorkspaceOwner([FromBody] WorkspaceOwnerCreateInputDto input)
        {
            var result = await _portalService.CreateWorkspaceOwnerAsync(input);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("workspace-owners/{id}/resend")]
        [HttpPost("~/api/super-admin/workspace-owners/{id}/resend-invite")]
        public async Task<IActionResult> ResendWorkspaceOwnerInvite(string id)
        {
            var result = await _portalService.ResendWorkspaceOwnerInviteAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("workspace-owners/{id}/revoke")]
        [HttpPost("~/api/super-admin/workspace-owners/{id}/revoke")]
        public async Task<IActionResult> RevokeWorkspaceOwnerInvite(string id)
        {
            var result = await _portalService.RevokeWorkspaceOwnerInviteAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("support-grants")]
        public async Task<IActionResult> GetSupportGrants(
            [FromQuery] string? search,
            [FromQuery] string? status)
        {
            var grants = await _portalService.GetSupportTicketsAsync(search, status);
            return Ok(grants);
        }

        [HttpPost("support-grants")]
        public async Task<IActionResult> CreateSupportGrant([FromBody] SupportTicketCreateInputDto input)
        {
            var result = await _portalService.CreateSupportTicketAsync(input);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("support-grants/{ticketId}/activate")]
        [HttpPost("~/api/super-admin/support-grants/{ticketId}/activate")]
        public async Task<IActionResult> ActivateGrant(string ticketId)
        {
            var result = await _portalService.ActivateSupportGrantAsync(ticketId);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPut("support-grants/{ticketId}/revoke")]
        [HttpPost("~/api/super-admin/support-grants/{ticketId}/revoke")]
        public async Task<IActionResult> RevokeGrant(string ticketId)
        {
            var result = await _portalService.RevokeSupportGrantAsync(ticketId);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        [HttpGet("tenants-monitoring")]
        public async Task<IActionResult> GetTenantsMonitoring(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _portalService.GetTenantMonitoringListAsync(search, status, page, pageSize);
            return Ok(result);
        }

        [HttpGet("tenants-monitoring/{id}")]
        public async Task<IActionResult> GetTenantMonitoringDetail(int id)
        {
            var result = await _portalService.GetTenantMonitoringDetailAsync(id);
            if (result == null)
            {
                return NotFound(new { message = "Tenant metadata not found." });
            }
            return Ok(result);
        }
    }
}
