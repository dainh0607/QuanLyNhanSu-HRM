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

        [HttpGet("education")]
        public async Task<IActionResult> GetEducation(int id)
        {
            var data = await _profileService.GetEducationAsync(id);
            return Ok(data);
        }

        [HttpGet("skills")]
        public async Task<IActionResult> GetSkills(int id)
        {
            var data = await _profileService.GetSkillsAsync(id);
            return Ok(data);
        }

        [HttpGet("certificates")]
        public async Task<IActionResult> GetCertificates(int id)
        {
            var data = await _profileService.GetCertificatesAsync(id);
            return Ok(data);
        }

        [HttpGet("work-history")]
        public async Task<IActionResult> GetWorkHistory(int id)
        {
            var data = await _profileService.GetWorkHistoryAsync(id);
            return Ok(data);
        }

        [HttpGet("bank-accounts")]
        public async Task<IActionResult> GetBankAccounts(int id)
        {
            var data = await _profileService.GetBankAccountsAsync(id);
            return Ok(data);
        }

        [HttpGet("health-record")]
        public async Task<IActionResult> GetHealthRecord(int id)
        {
            var data = await _profileService.GetHealthRecordAsync(id);
            return Ok(data);
        }

        [HttpGet("dependents")]
        public async Task<IActionResult> GetDependents(int id)
        {
            var data = await _profileService.GetDependentsAsync(id);
            return Ok(data);
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
