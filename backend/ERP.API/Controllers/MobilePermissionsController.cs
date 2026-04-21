using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Authorization;
using ERP.Services.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MobilePermissionsController : ControllerBase
    {
        private readonly IMobilePermissionService _mobilePermissionService;

        public MobilePermissionsController(IMobilePermissionService mobilePermissionService)
        {
            _mobilePermissionService = mobilePermissionService;
        }

        [HttpGet("employee/{employeeId}")]
        [HasPermission("employees", "read")]
        public async Task<IActionResult> GetEmployeePermissions(int employeeId)
        {
            try
            {
                var result = await _mobilePermissionService.GetEmployeePermissionsAsync(employeeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("employee/{employeeId}/default")]
        [HasPermission("employees", "read")]
        public async Task<IActionResult> GetDefaultPermissions(int employeeId)
        {
            try
            {
                var result = await _mobilePermissionService.GetDefaultPermissionsAsync(employeeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("employee/{employeeId}")]
        [HasPermission("employees", "update")]
        public async Task<IActionResult> UpdatePermissions(int employeeId, [FromBody] UpdateMobilePermissionsDto dto)
        {
            try
            {
                var success = await _mobilePermissionService.UpdatePermissionsAsync(employeeId, dto.AllowedPermissionIds);
                if (!success) return BadRequest(new { Message = "Cập nhật phân quyền thất bại." });
                return Ok(new { Message = "Cập nhật phân quyền thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
