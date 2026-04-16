using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;
using ERP.Services.Employees;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/employees/{id}/details")]
    [Authorize]
    [HasPermission("employee", "read")]
    public class EmployeeDetailsController : ControllerBase
    {
        private readonly IEmployeeProfileService _profileService;

        public EmployeeDetailsController(IEmployeeProfileService profileService)
        {
            _profileService = profileService;
        }

        [HttpPut("education")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateEducation(int id, [FromBody] List<EducationDto> dtos)
        {
            var success = await _profileService.UpdateEducationAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Education records updated" });
        }

        [HttpPut("skills")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateSkills(int id, [FromBody] List<EmployeeSkillDto> dtos)
        {
            var success = await _profileService.UpdateSkillsAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Skills updated" });
        }

        [HttpPut("certificates")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateCertificates(int id, [FromBody] List<EmployeeCertificateDto> dtos)
        {
            var success = await _profileService.UpdateCertificatesAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Certificates updated" });
        }

        [HttpPut("work-history")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateWorkHistory(int id, [FromBody] List<WorkHistoryDto> dtos)
        {
            var success = await _profileService.UpdateWorkHistoryAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Work history updated" });
        }

        [HttpPut("bank-accounts")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateBankAccounts(int id, [FromBody] List<BankAccountDto> dtos)
        {
            var success = await _profileService.UpdateBankAccountsAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Bank accounts updated" });
        }

        [HttpPut("health-record")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateHealthRecord(int id, [FromBody] HealthRecordDto dto)
        {
            var success = await _profileService.UpdateHealthRecordAsync(id, dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Health record updated" });
        }

        [HttpPut("dependents")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateDependents(int id, [FromBody] List<DependentDto> dtos)
        {
            var success = await _profileService.UpdateDependentsAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Dependents updated" });
        }
    }
}
