using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Departments;
using ERP.Services.Organization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [HasPermission("organization", "read")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IOrganizationService _orgService;

        public DepartmentsController(IOrganizationService orgService)
        {
            _orgService = orgService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null)
        {
            return Ok(await _orgService.GetPagedDepartmentsAsync(pageNumber, pageSize, searchTerm));
        }

        [HttpGet("dropdown")]
        public async Task<IActionResult> GetDropdown([FromQuery] int? branchId = null)
        {
            return Ok(await _orgService.GetDepartmentsDropdownAsync(branchId));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var res = await _orgService.GetDepartmentByIdAsync(id);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpPost]
        [HasPermission("organization", "create")]
        public async Task<IActionResult> Create([FromBody] DepartmentCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var res = await _orgService.CreateDepartmentAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = res.Id }, res);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [HasPermission("organization", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] DepartmentUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var success = await _orgService.UpdateDepartmentAsync(id, dto);
                if (!success) return NotFound();
                return Ok(new { message = "Cập nhật phòng ban thành công." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [HasPermission("organization", "delete")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _orgService.DeleteDepartmentAsync(id);
                if (!success) return NotFound();
                return Ok(new { message = "Xóa phòng ban thành công." });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPost("bulk-delete")]
        [HasPermission("organization", "delete")]
        public async Task<IActionResult> BulkDelete([FromBody] List<int> ids)
        {
            var count = await _orgService.BulkDeleteDepartmentsAsync(ids);
            return Ok(new { message = $"Đã xóa {count}/{ids.Count} phòng ban thành công.", count });
        }
    }
}
