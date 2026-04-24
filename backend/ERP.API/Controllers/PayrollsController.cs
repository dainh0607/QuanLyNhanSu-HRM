using System.Threading.Tasks;
using ERP.API.Authorization;
using ERP.DTOs.Payroll;
using ERP.Services.Payroll;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/v1/[controller]")]
    public class PayrollsController : ControllerBase
    {
        private readonly IPayrollService _payrollService;

        public PayrollsController(IPayrollService payrollService)
        {
            _payrollService = payrollService;
        }

        [HttpGet]
        [HasPermission("payroll", "read")]
        public async Task<IActionResult> GetPayrollTables([FromQuery] int skip = 0, [FromQuery] int take = 10)
        {
            var data = await _payrollService.GetPayrollTablesAsync(skip, take);
            return Ok(data);
        }

        [HttpGet("by-period")]
        [HasPermission("payroll", "read")]
        public async Task<IActionResult> GetPayrolls([FromQuery] int month, [FromQuery] int year, [FromQuery] int skip = 0, [FromQuery] int take = 10)
        {
            var data = await _payrollService.GetPayrollsAsync(month, year, skip, take);
            return Ok(data);
        }

        [HttpGet("period/{periodId}")]
        [HasPermission("payroll", "read")]
        public async Task<IActionResult> GetPayrollsByPeriod(int periodId, [FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            var data = await _payrollService.GetPayrollsByPeriodAsync(periodId, skip, take);
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

        [HttpPost]
        [HasPermission("payroll", "create")]
        public async Task<IActionResult> CreatePayroll([FromBody] ERP.DTOs.Payroll.CreatePayrollRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try 
            {
                var id = await _payrollService.CreatePayrollAsync(request);
                return Ok(new { Id = id, Success = true });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("types")]
        [HasPermission("payroll", "read")]
        public async Task<IActionResult> GetPayrollTypes([FromQuery] int skip = 0, [FromQuery] int take = 10)
        {
            var data = await _payrollService.GetPayrollTypesAsync(skip, take);
            return Ok(data);
        }

        [HttpPost("types")]
        [HasPermission("payroll", "create")]
        public async Task<IActionResult> CreatePayrollType([FromBody] PayrollTypeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var id = await _payrollService.CreatePayrollTypeAsync(dto);
                return Ok(new { Id = id });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("types/{id}")]
        [HasPermission("payroll", "delete")]
        public async Task<IActionResult> DeletePayrollType(int id)
        {
            try
            {
                var success = await _payrollService.DeletePayrollTypeAsync(id);
                if (!success) return NotFound();
                return Ok(new { Message = "Xóa loại bảng lương thành công." });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("{id}/approve")]
        [HasPermission("payroll", "approve")]
        public async Task<IActionResult> ApprovePayroll(int id)
        {
            var userId = 1; // Temporary mock user ID, in production get from Token claims
            var result = await _payrollService.ApprovePayrollAsync(id, userId);
            return Ok(new { Success = result });
        }

        [HttpDelete("{id}")]
        [HasPermission("payroll", "delete")]
        public async Task<IActionResult> DeletePayroll(int id)
        {
            try
            {
                var success = await _payrollService.DeletePayrollTableAsync(id);
                if (!success) return NotFound();
                return Ok(new { Message = "Xóa bảng lương thành công." });
            }
            catch (System.InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
