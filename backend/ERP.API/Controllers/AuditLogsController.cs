using System;
using System.Security.Claims;
using System.Threading.Tasks;
using ERP.DTOs.AuditLog;
using ERP.Services.AuditLog;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/audit-logs")]
    [Authorize]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogsController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet]
        [HasPermission("employee", "read")]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] int? employeeId,
            [FromQuery] string? search,
            [FromQuery] string? startDate,
            [FromQuery] string? endDate,
            [FromQuery] string? action,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 20)
        {
            try
            {
                var filter = new AuditLogFilterDto
                {
                    EmployeeId = employeeId,
                    Search = search,
                    StartDate = startDate,
                    EndDate = endDate,
                    Action = action,
                    Skip = skip,
                    Take = take
                };

                var result = await _auditLogService.GetAuditLogsAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost]
        [HasPermission("employee", "update")]
        public async Task<IActionResult> CreateAuditLog([FromBody] AuditLogCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                int? userId = null;
                if (int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id))
                {
                    userId = id;
                }

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
                var userAgent = Request.Headers["User-Agent"].ToString();
                var device = userAgent.Length > 200 ? userAgent[..200] : userAgent;

                var logId = await _auditLogService.CreateAuditLogAsync(dto, userId, ipAddress, device, "", "");
                return Ok(new { Message = "Đã ghi nhật ký thao tác.", LogId = logId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
