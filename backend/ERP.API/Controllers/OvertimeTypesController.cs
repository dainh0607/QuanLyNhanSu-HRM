using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Lookup;
using ERP.DTOs.Lookup;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/overtime-types")]
    [Authorize]
    public class OvertimeTypesController : ControllerBase
    {
        private readonly IOvertimeTypeService _overtimeTypeService;

        public OvertimeTypesController(IOvertimeTypeService overtimeTypeService)
        {
            _overtimeTypeService = overtimeTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] string? searchTerm, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _overtimeTypeService.GetPagedAsync(searchTerm, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _overtimeTypeService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _overtimeTypeService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy loại làm thêm giờ" });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OvertimeTypeCreateUpdateDto dto)
        {
            try
            {
                var id = await _overtimeTypeService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Tạo mới loại làm thêm giờ thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] OvertimeTypeCreateUpdateDto dto)
        {
            try
            {
                var result = await _overtimeTypeService.UpdateAsync(id, dto);
                if (!result) return NotFound(new { message = "Không tìm thấy loại làm thêm giờ" });
                return Ok(new { message = "Cập nhật loại làm thêm giờ thành công" });
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
                var result = await _overtimeTypeService.DeleteAsync(id);
                if (!result) return NotFound(new { message = "Không tìm thấy loại làm thêm giờ" });
                return Ok(new { message = "Xóa loại làm thêm giờ thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
