using System;
using System.Threading.Tasks;
using ERP.DTOs.Payroll;
using ERP.Services.Payroll;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/v1/payroll-config")]
    [Authorize]
    public class PayrollConfigController : ControllerBase
    {
        private readonly IPayrollConfigService _configService;

        public PayrollConfigController(IPayrollConfigService configService)
        {
            _configService = configService;
        }

        // ==================== SALARY GRADES ====================

        [HttpGet("salary-grades")]
        public async Task<IActionResult> GetSalaryGrades([FromQuery] string paymentType = "MONTHLY")
        {
            var data = await _configService.GetSalaryGradesAsync(paymentType);
            return Ok(data);
        }

        [HttpPost("salary-grades")]
        public async Task<IActionResult> CreateSalaryGrade([FromBody] SalaryGradeConfigDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _configService.CreateSalaryGradeAsync(dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("salary-grades/{id}")]
        public async Task<IActionResult> UpdateSalaryGrade(int id, [FromBody] SalaryGradeConfigDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _configService.UpdateSalaryGradeAsync(id, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("salary-grades/{id}")]
        public async Task<IActionResult> DeleteSalaryGrade(int id)
        {
            var (success, message) = await _configService.DeleteSalaryGradeAsync(id);
            if (!success) return BadRequest(new { success, message });
            return Ok(new { success, message });
        }

        // ==================== VARIABLES ====================

        [HttpGet("variables")]
        public async Task<IActionResult> GetVariables([FromQuery] string category = "allowance")
        {
            var data = await _configService.GetVariablesAsync(category);
            return Ok(data);
        }

        [HttpPost("variables")]
        public async Task<IActionResult> CreateVariable([FromBody] PayrollVariableDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _configService.CreateVariableAsync(dto);
                return Ok(new { success = true, data = result });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("variables/{id}")]
        public async Task<IActionResult> UpdateVariable(int id, [FromBody] PayrollVariableDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _configService.UpdateVariableAsync(id, dto);
                return Ok(new { success = true, data = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("variables/{id}")]
        public async Task<IActionResult> DeleteVariable(int id, [FromQuery] string category = "allowance")
        {
            var (success, message) = await _configService.DeleteVariableAsync(id, category);
            if (!success) return BadRequest(new { success, message });
            return Ok(new { success, message });
        }
    }
}
