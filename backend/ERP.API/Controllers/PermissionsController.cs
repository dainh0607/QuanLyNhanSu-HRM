using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Authorization;
using ERP.DTOs.Auth;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/permissions")]
    [Authorize]
    public class PermissionsController : ControllerBase
    {
        private readonly IPermissionMatrixService _matrixService;

        public PermissionsController(IPermissionMatrixService matrixService)
        {
            _matrixService = matrixService;
        }

        [HttpGet("matrix")]
        public async Task<IActionResult> GetMatrix([FromQuery] string moduleCode)
        {
            try
            {
                var matrix = await _matrixService.GetMatrixByModuleAsync(moduleCode);
                return Ok(matrix);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpPut("matrix")]
        public async Task<IActionResult> UpdateMatrix([FromBody] PermissionMatrixUpdateDto dto)
        {
            if (dto == null) return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            try
            {
                var result = await _matrixService.UpdateMatrixAsync(dto);
                if (result)
                {
                    return Ok(new { message = "Cập nhật phân quyền thành công" });
                }
                return BadRequest(new { message = "Không thể cập nhật phân quyền" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpGet("modules")]
        public async Task<IActionResult> GetModules()
        {
            var modules = ModuleFeatures.Modules.Select(m => new { m.Code, m.Name }).ToList();
            return Ok(modules);
        }
    }
}
