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
    [Route("api/employees/{id}/profile")]
    [Authorize]
    [HasPermission("employee", "read")]
    public class EmployeeProfileController : ControllerBase
    {
        private readonly IEmployeeProfileService _profileService;

        public EmployeeProfileController(IEmployeeProfileService profileService)
        {
            _profileService = profileService;
        }

        [HttpPut("avatar")]
        public async Task<IActionResult> UpdateAvatar(int id, [FromBody] AvatarUpdateDto dto)
        {
            var success = await _profileService.UpdateAvatarAsync(id, dto?.Avatar);
            if (!success) return BadRequest();
            return Ok(new { Message = "Avatar updated" });
        }

        [HttpPut("basic-info")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateBasicInfo(int id, [FromBody] BasicInfoDto dto)
        {
            try
            {
                var success = await _profileService.UpdateBasicInfoAsync(id, dto);
                if (!success) return BadRequest();
                return Ok(new { Message = "Basic information updated" });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("identity")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateIdentity(int id, [FromBody] IdentityInfoDto dto)
        {
            var success = await _profileService.UpdateIdentityInfoAsync(id, dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Identity information updated" });
        }

        [HttpPut("contact")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateContact(int id, [FromBody] ContactInfoDto dto)
        {
            var success = await _profileService.UpdateContactInfoAsync(id, dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Contact information updated" });
        }

        [HttpPut("addresses")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateAddresses(int id, [FromBody] AddressProfileUpdateDto dto)
        {
            var request = dto ?? new AddressProfileUpdateDto();
            var success = await _profileService.UpdateAddressesAsync(id, request);
            if (!success) return BadRequest();
            return Ok(new { Message = "Addresses updated" });
        }

        [HttpPut("emergency-contacts")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateEmergencyContacts(int id, [FromBody] List<EmergencyContactDto> dtos)
        {
            var success = await _profileService.UpdateEmergencyContactsAsync(id, dtos);
            if (!success && dtos.Count > 0) return BadRequest();
            return Ok(new { Message = "Emergency contacts updated" });
        }

        // ─── Tab: Thông tin khác (US-8) ─────────────────────────────────────────

        /// <summary>
        /// AC 8.3: Lấy cụm dữ liệu "Thông tin khác" của nhân viên.
        /// Nếu nhân viên chưa có dữ liệu, marital_status mặc định trả về "SINGLE".
        /// </summary>
        [HttpGet("other-info")]
        public async Task<IActionResult> GetOtherInfo(int id)
        {
            var result = await _profileService.GetOtherInfoDetailsAsync(id);
            if (result == null) return NotFound(new { Message = $"Không tìm thấy nhân viên có Id = {id}." });
            return Ok(result);
        }

        /// <summary>
        /// AC 8.4: Cập nhật cụm dữ liệu "Thông tin khác" của nhân viên.
        /// Validation MST (10 hoặc 13 chữ số thuần) được thực hiện qua [RegularExpression] trên DTO.
        /// </summary>
        [HttpPut("other-info")]
        [HasPermission("employee", "update")]
    public async Task<IActionResult> UpdateOtherInfo(int id, [FromBody] OtherInfoDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _profileService.UpdateOtherInfoAsync(id, dto);
            if (!success) return NotFound(new { Message = $"Không tìm thấy nhân viên có Id = {id}." });

            return Ok(new { Message = "Cập nhật thông tin khác thành công." });
        }
    }
}
