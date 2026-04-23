using System.Threading.Tasks;
using System.Collections.Generic;
using ERP.DTOs.Regions;
using ERP.Services.Organization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;
using System;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [HasPermission("organization", "read")]
    public class RegionsController : ControllerBase
    {
        private readonly IOrganizationService _orgService;

        public RegionsController(IOrganizationService orgService)
        {
            _orgService = orgService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string? searchTerm = null)
        {
            return Ok(await _orgService.GetPagedRegionsAsync(pageNumber, pageSize, searchTerm));
        }

        [HttpGet("dropdown")]
        public async Task<IActionResult> GetDropdown()
        {
            return Ok(await _orgService.GetRegionsDropdownAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var res = await _orgService.GetRegionByIdAsync(id);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpPost]
        [HasPermission("organization", "create")]
        public async Task<IActionResult> Create([FromBody] RegionCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var res = await _orgService.CreateRegionAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = res.Id }, res);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [HasPermission("organization", "update")]
        public async Task<IActionResult> Update(int id, [FromBody] RegionUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var success = await _orgService.UpdateRegionAsync(id, dto);
                if (!success) return NotFound();
                return Ok(new { message = "Cập nhật vùng thành công." });
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
                var success = await _orgService.DeleteRegionAsync(id);
                if (!success) return NotFound();
                return Ok(new { message = "Xóa vùng thành công." });
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
            var count = await _orgService.BulkDeleteRegionsAsync(ids);
            return Ok(new { message = $"Đã xóa {count}/{ids.Count} vùng thành công.", count });
        }
    }
}
