using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;
using ERP.Services.Employees;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/employees/{id}/profile")]
    [Authorize]
    public class EmployeeProfileController : ControllerBase
    {
        private readonly IEmployeeProfileService _profileService;

        public EmployeeProfileController(IEmployeeProfileService profileService)
        {
            _profileService = profileService;
        }

        [HttpPut("basic-info")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateBasicInfo(int id, [FromBody] BasicInfoDto dto)
        {
            var success = await _profileService.UpdateBasicInfoAsync(id, dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Basic information updated" });
        }

        [HttpPut("identity")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateIdentity(int id, [FromBody] IdentityInfoDto dto)
        {
            var success = await _profileService.UpdateIdentityInfoAsync(id, dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Identity information updated" });
        }

        [HttpPut("contact")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateContact(int id, [FromBody] ContactInfoDto dto)
        {
            var success = await _profileService.UpdateContactInfoAsync(id, dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Contact information updated" });
        }

        [HttpPut("addresses")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateAddresses(int id, [FromBody] AddressProfileUpdateDto dto)
        {
            var request = dto ?? new AddressProfileUpdateDto();
            var success = await _profileService.UpdateAddressesAsync(id, request);
            if (!success) return BadRequest();
            return Ok(new { Message = "Addresses updated" });
        }

        [HttpPut("emergency-contacts")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> UpdateEmergencyContacts(int id, [FromBody] List<EmergencyContactDto> dtos)
        {
            var success = await _profileService.UpdateEmergencyContactsAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Emergency contacts updated" });
        }
    }
}
