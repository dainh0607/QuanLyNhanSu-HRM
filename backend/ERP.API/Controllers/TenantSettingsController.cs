using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Settings;
using ERP.DTOs.Settings;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/settings/tenant")]
    [Authorize]
    public class TenantSettingsController : ControllerBase
    {
        private readonly ITenantSettingService _tenantSettingService;

        public TenantSettingsController(ITenantSettingService tenantSettingService)
        {
            _tenantSettingService = tenantSettingService;
        }

        [HttpGet("employee-sort")]
        public async Task<IActionResult> GetEmployeeSortConfig()
        {
            var result = await _tenantSettingService.GetEmployeeSortConfigAsync();
            return Ok(result);
        }

        [HttpPut("employee-sort")]
        public async Task<IActionResult> UpdateEmployeeSortConfig([FromBody] TenantSortConfigDto dto)
        {
            var result = await _tenantSettingService.UpdateEmployeeSortConfigAsync(dto);
            if (!result) return NotFound(new { message = "Không tìm thấy thông tin công ty" });
            return Ok(new { message = "Cập nhật cấu hình sắp xếp thành công" });
        }

        [HttpPost("employee-sort/reset")]
        public async Task<IActionResult> ResetEmployeeSortConfig()
        {
            var result = await _tenantSettingService.ResetEmployeeSortConfigAsync();
            if (!result) return NotFound(new { message = "Không tìm thấy thông tin công ty" });
            return Ok(new { message = "Đã khôi phục cài đặt sắp xếp về mặc định" });
        }
    }
}
