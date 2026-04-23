using Microsoft.AspNetCore.Mvc;
using ERP.Services.Tenant;
using ERP.DTOs.Tenant;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/tenant-profiles")]
    [Authorize]
    public class TenantProfilesController : ControllerBase
    {
        private readonly ITenantProfileService _tenantProfileService;

        public TenantProfilesController(ITenantProfileService tenantProfileService)
        {
            _tenantProfileService = tenantProfileService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var profile = await _tenantProfileService.GetProfileAsync();
                return Ok(profile);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] TenantProfileUpdateDto updateDto)
        {
            if (updateDto == null) return BadRequest(new { message = "Data is required" });

            try
            {
                var result = await _tenantProfileService.UpdateProfileAsync(updateDto);
                if (result)
                {
                    return Ok(new { message = "Cập nhật thông tin doanh nghiệp thành công" });
                }
                return BadRequest(new { message = "Không thể cập nhật thông tin" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã có lỗi xảy ra: " + ex.Message });
            }
        }
    }
}
