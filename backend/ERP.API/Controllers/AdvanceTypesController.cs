using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Lookup;
using ERP.DTOs.Lookup;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/advance-types")]
    [Authorize]
    public class AdvanceTypesController : ControllerBase
    {
        private readonly IAdvanceTypeService _advanceTypeService;

        public AdvanceTypesController(IAdvanceTypeService advanceTypeService)
        {
            _advanceTypeService = advanceTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] string? searchTerm, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _advanceTypeService.GetPagedAsync(searchTerm, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _advanceTypeService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _advanceTypeService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy loại tạm ứng" });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AdvanceTypeCreateUpdateDto dto)
        {
            try
            {
                var id = await _advanceTypeService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Tạo mới loại tạm ứng thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AdvanceTypeCreateUpdateDto dto)
        {
            try
            {
                var result = await _advanceTypeService.UpdateAsync(id, dto);
                if (!result) return NotFound(new { message = "Không tìm thấy loại tạm ứng" });
                return Ok(new { message = "Cập nhật loại tạm ứng thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _advanceTypeService.DeleteAsync(id);
                if (!result) return NotFound(new { message = "Không tìm thấy loại tạm ứng" });
                return Ok(new { message = "Xóa loại tạm ứng thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
