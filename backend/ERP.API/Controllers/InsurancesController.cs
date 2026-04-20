using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;
using ERP.Services.Employees;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InsurancesController : ControllerBase
    {
        private readonly IInsuranceService _insuranceService;

        public InsurancesController(IInsuranceService insuranceService)
        {
            _insuranceService = insuranceService;
        }

        [HttpGet("employee/{employeeId}")]
        [HasPermission("employees", "read")]
        public async Task<IActionResult> GetByEmployeeId(int employeeId)
        {
            var result = await _insuranceService.GetInsurancesByEmployeeIdAsync(employeeId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission("employees", "read")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _insuranceService.GetInsuranceByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        [HasPermission("employees", "update")]
        public async Task<IActionResult> Create([FromBody] InsuranceCreateDto dto)
        {
            var success = await _insuranceService.CreateInsuranceAsync(dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Insurance record created successfully" });
        }

        [HttpDelete("{id}")]
        [HasPermission("employees", "update")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _insuranceService.DeleteInsuranceAsync(id);
            if (!success) return BadRequest();
            return Ok(new { Message = "Insurance record deleted successfully" });
        }
    }
}
