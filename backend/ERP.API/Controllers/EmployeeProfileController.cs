using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;
using ERP.Services.Employees;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/employees/{id}")]
    [Authorize]
    public class EmployeeProfileController : ControllerBase
    {
        private readonly IEmployeeProfileService _profileService;

        public EmployeeProfileController(IEmployeeProfileService profileService)
        {
            _profileService = profileService;
        }

        [HttpPut("bank-accounts")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateBankAccounts(int id, [FromBody] List<BankAccountDto> dtos)
        {
            var success = await _profileService.UpdateBankAccountsAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Bank accounts updated" });
        }

        [HttpPut("emergency-contacts")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateEmergencyContacts(int id, [FromBody] List<EmergencyContactDto> dtos)
        {
            var success = await _profileService.UpdateEmergencyContactsAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Emergency contacts updated" });
        }

        [HttpPut("health-record")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateHealthRecord(int id, [FromBody] HealthRecordDto dto)
        {
            var success = await _profileService.UpdateHealthRecordAsync(id, dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Health record updated" });
        }

        [HttpPut("addresses")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateAddresses(int id, [FromBody] List<EmployeeAddressDto> dtos)
        {
            var success = await _profileService.UpdateAddressesAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Addresses updated" });
        }

        [HttpPut("education")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateEducation(int id, [FromBody] List<EducationDto> dtos)
        {
            var success = await _profileService.UpdateEducationAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Education records updated" });
        }

        [HttpPut("skills")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateSkills(int id, [FromBody] List<EmployeeSkillDto> dtos)
        {
            var success = await _profileService.UpdateSkillsAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Skills updated" });
        }

        [HttpPut("certificates")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateCertificates(int id, [FromBody] List<EmployeeCertificateDto> dtos)
        {
            var success = await _profileService.UpdateCertificatesAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Certificates updated" });
        }

        [HttpPut("dependents")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateDependents(int id, [FromBody] List<DependentDto> dtos)
        {
            var success = await _profileService.UpdateDependentsAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Dependents updated" });
        }
    }
}
