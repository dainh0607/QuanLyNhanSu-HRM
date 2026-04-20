using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;
using ERP.Services.Employees;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/employees/{id}/salary")]
    [Authorize]
    [HasPermission("payroll", "read")]
    public class EmployeeSalaryController : ControllerBase
    {
        private readonly ISalaryConfigurationService _salaryService;

        public EmployeeSalaryController(ISalaryConfigurationService salaryService)
        {
            _salaryService = salaryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSalaryPackage(int id)
        {
            var result = await _salaryService.GetSalaryPackageAsync(id);
            return Ok(result);
        }

        [HttpPut]
        [HasPermission("payroll", "update")]
        public async Task<IActionResult> UpdateSalaryPackage(int id, [FromBody] SalaryPackageDto dto)
        {
            try
            {
                var success = await _salaryService.UpdateSalaryPackageAsync(id, dto);
                if (!success) return BadRequest();
                return Ok(new { Message = "Cập nhật cấu hình lương thành công." });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }

    [ApiController]
    [Route("api/salary-grades")]
    [Authorize]
    public class SalaryGradesController : ControllerBase
    {
        private readonly ISalaryConfigurationService _salaryService;

        public SalaryGradesController(ISalaryConfigurationService salaryService)
        {
            _salaryService = salaryService;
        }

        [HttpPost]
        [HasPermission("payroll", "manage")]
        public async Task<IActionResult> CreateSalaryGrade([FromBody] SalaryGradeCreateDto dto)
        {
            var result = await _salaryService.CreateSalaryGradeAsync(dto);
            return Ok(result);
        }
    }
}
