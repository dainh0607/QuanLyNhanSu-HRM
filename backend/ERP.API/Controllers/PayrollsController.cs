using System.Threading.Tasks;
using ERP.API.Authorization;
using ERP.Services.Payroll;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PayrollsController : ControllerBase
    {
        private readonly IPayrollService _payrollService;

        public PayrollsController(IPayrollService payrollService)
        {
            _payrollService = payrollService;
        }

        [HttpGet]
        [HasPermission("payroll", "read")]
        public async Task<IActionResult> GetPayrolls([FromQuery] int month, [FromQuery] int year, [FromQuery] int skip = 0, [FromQuery] int take = 10)
        {
            var data = await _payrollService.GetPayrollsAsync(month, year, skip, take);
            return Ok(data);
        }

        [HttpGet("{id}")]
        [HasPermission("payroll", "read")]
        public async Task<IActionResult> GetPayrollDetail(int id)
        {
            var data = await _payrollService.GetPayrollDetailAsync(id);
            if (data == null) return NotFound();
            return Ok(data);
        }

        [HttpPost("generate")]
        [HasPermission("payroll", "create")]
        public async Task<IActionResult> GeneratePayrolls([FromQuery] int month, [FromQuery] int year)
        {
            var result = await _payrollService.GeneratePayrollsAsync(month, year);
            return Ok(new { Success = result });
        }

        [HttpPost("{id}/approve")]
        [HasPermission("payroll", "approve")]
        public async Task<IActionResult> ApprovePayroll(int id)
        {
            var userId = 1; // Temporary mock user ID, in production get from Token claims
            var result = await _payrollService.ApprovePayrollAsync(id, userId);
            return Ok(new { Success = result });
        }
    }
}
