using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Settings;
using ERP.DTOs.Settings;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/settings/employee-fields")]
    [Authorize]
    public class EmployeeFieldsController : ControllerBase
    {
        private readonly ISystemFieldService _systemFieldService;
        private readonly ITenantCustomFieldService _customFieldService;

        public EmployeeFieldsController(ISystemFieldService systemFieldService, ITenantCustomFieldService customFieldService)
        {
            _systemFieldService = systemFieldService;
            _customFieldService = customFieldService;
        }

        [HttpGet("default")]
        public async Task<IActionResult> GetDefaultFields()
        {
            var result = await _systemFieldService.GetDefaultFieldsAsync();
            return Ok(result);
        }

        [HttpGet("custom")]
        public async Task<IActionResult> GetCustomPaged([FromQuery] string? searchTerm, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _customFieldService.GetPagedAsync(searchTerm, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("custom/all")]
        public async Task<IActionResult> GetAllCustom()
        {
            var result = await _customFieldService.GetAllAsync();
            return Ok(result);
        }

        [HttpPost("custom")]
        public async Task<IActionResult> CreateCustom([FromBody] CustomFieldCreateUpdateDto dto)
        {
            try
            {
                var id = await _customFieldService.CreateAsync(dto);
                return Ok(new { id, message = "Thêm trường tùy chỉnh thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("custom/{id}")]
        public async Task<IActionResult> UpdateCustom(int id, [FromBody] CustomFieldCreateUpdateDto dto)
        {
            try
            {
                var result = await _customFieldService.UpdateAsync(id, dto);
                if (!result) return NotFound(new { message = "Không tìm thấy trường tùy chỉnh" });
                return Ok(new { message = "Cập nhật trường tùy chỉnh thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("custom/{id}")]
        public async Task<IActionResult> DeleteCustom(int id)
        {
            var result = await _customFieldService.DeleteAsync(id);
            if (!result) return NotFound(new { message = "Không tìm thấy trường tùy chỉnh" });
            return Ok(new { message = "Xóa trường tùy chỉnh thành công" });
        }
    }
}
