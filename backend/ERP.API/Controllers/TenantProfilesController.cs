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

        [HttpGet("branding/{subdomain}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBranding(string subdomain)
        {
            var branding = await _tenantProfileService.GetBrandingBySubdomainAsync(subdomain);
            if (branding == null) return NotFound(new { message = "Không tìm thấy thông tin thương hiệu cho tên miền này" });
            return Ok(branding);
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
            catch (InvalidOperationException ex)
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

        [HttpPost("logo")]
        public async Task<IActionResult> UploadLogo(Microsoft.AspNetCore.Http.IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file logo" });

            // AC 1.2: Validation
            var allowedExtensions = new[] { ".png", ".gif", ".jpg", ".jpeg" };
            var extension = System.IO.Path.GetExtension(file.FileName).ToLower();
            if (!System.Linq.Enumerable.Contains(allowedExtensions, extension))
                return BadRequest(new { message = "Chỉ chấp nhận định dạng .png, .gif, .jpg, .jpeg" });

            if (file.Length > 2 * 1024 * 1024)
                return BadRequest(new { message = "Kích thước logo tối đa là 2MB" });

            try
            {
                using var stream = file.OpenReadStream();
                var url = await _tenantProfileService.UploadLogoAsync(stream, file.FileName, file.ContentType);
                return Ok(new { url });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi tải logo: " + ex.Message });
            }
        }
    }
}
