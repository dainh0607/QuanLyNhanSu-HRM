using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.API.Authorization;
using ERP.DTOs.Auth;
using ERP.Services.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/auth-mgmt")]
    [Authorize]
    [HasPermission("system", "update")] // Only Tenant Admins or System Admins
    public class AuthorizationManagementController : ControllerBase
    {
        private readonly IAuthorizationManagementService _mgmtService;

        public AuthorizationManagementController(IAuthorizationManagementService mgmtService)
        {
            _mgmtService = mgmtService;
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _mgmtService.GetRolesAsync();
            return Ok(roles);
        }

        [HttpGet("roles/{id}")]
        public async Task<IActionResult> GetRole(int id)
        {
            var role = await _mgmtService.GetRoleByIdAsync(id);
            if (role == null) return NotFound();
            return Ok(role);
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRole([FromBody] RoleCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var id = await _mgmtService.CreateRoleAsync(dto);
            return CreatedAtAction(nameof(GetRole), new { id = id }, new { Id = id });
        }

        [HttpPut("roles/{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleCreateUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var success = await _mgmtService.UpdateRoleAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("roles/{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            try
            {
                var success = await _mgmtService.DeleteRoleAsync(id);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("roles/{id}/permissions")]
        public async Task<IActionResult> GetRolePermissions(int id)
        {
            try
            {
                var permissions = await _mgmtService.GetRolePermissionsAsync(id);
                return Ok(permissions);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpPut("roles/{id}/permissions")]
        public async Task<IActionResult> UpdateRolePermissions(int id, [FromBody] PermissionMappingDto dto)
        {
            if (id != dto.RoleId) return BadRequest("Role ID mismatch.");
            
            try
            {
                var success = await _mgmtService.UpdateRolePermissionsAsync(dto);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("lookups")]
        public async Task<IActionResult> GetLookups()
        {
            var lookups = await _mgmtService.GetPermissionLookupsAsync();
            return Ok(lookups);
        }

        [HttpPost("user-roles/assign")]
        public async Task<IActionResult> AssignRole([FromBody] UserRoleAssignmentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            try
            {
                await _mgmtService.AssignRoleToUserAsync(dto);
                return Ok(new { Message = "Đã gán quyền thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("user-roles/{userId}")]
        public async Task<IActionResult> GetUserRoles(int userId)
        {
            var assignments = await _mgmtService.GetUserRolesAsync(userId);
            return Ok(assignments);
        }

        [HttpDelete("user-roles/{id}")]
        public async Task<IActionResult> RevokeRole(int id)
        {
            var success = await _mgmtService.RevokeRoleFromUserAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
