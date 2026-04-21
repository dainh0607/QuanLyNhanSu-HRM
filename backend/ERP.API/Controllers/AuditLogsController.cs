using System;
using System.Threading.Tasks;
using ERP.Services.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditLogsController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet("employee/{employeeId}")]
        [HasPermission("employees", "read")]
        public async Task<IActionResult> GetLogs(
            int employeeId, 
            [FromQuery] string? keyword, 
            [FromQuery] DateTime? fromDate, 
            [FromQuery] DateTime? toDate, 
            [FromQuery] int skip = 0, 
            [FromQuery] int take = 50)
        {
            try
            {
                var logs = await _auditService.GetAuditLogsAsync(employeeId, keyword, fromDate, toDate, skip, take);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("employee/{employeeId}/export")]
        [HasPermission("employees", "read")]
        public async Task<IActionResult> ExportLogs(
            int employeeId, 
            [FromQuery] string? keyword, 
            [FromQuery] DateTime? fromDate, 
            [FromQuery] DateTime? toDate)
        {
            try
            {
                var fileContent = await _auditService.ExportAuditLogsToExcelAsync(employeeId, keyword, fromDate, toDate);
                string fileName = $"AuditLogs_Emp{employeeId}_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                
                return File(
                    fileContent, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
