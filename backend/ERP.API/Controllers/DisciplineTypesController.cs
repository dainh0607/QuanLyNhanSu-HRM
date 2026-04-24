using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Lookup;
using ERP.DTOs.Lookup;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/discipline-types")]
    [Authorize]
    public class DisciplineTypesController : ControllerBase
    {
        private readonly IDisciplineTypeService _disciplineTypeService;

        public DisciplineTypesController(IDisciplineTypeService disciplineTypeService)
        {
            _disciplineTypeService = disciplineTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] string? searchTerm, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _disciplineTypeService.GetPagedAsync(searchTerm, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _disciplineTypeService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _disciplineTypeService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy hình thức kỷ luật" });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DisciplineTypeCreateUpdateDto dto)
        {
            try
            {
                var id = await _disciplineTypeService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Tạo mới hình thức kỷ luật thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] DisciplineTypeCreateUpdateDto dto)
        {
            try
            {
                var result = await _disciplineTypeService.UpdateAsync(id, dto);
                if (!result) return NotFound(new { message = "Không tìm thấy hình thức kỷ luật" });
                return Ok(new { message = "Cập nhật hình thức kỷ luật thành công" });
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
                var result = await _disciplineTypeService.DeleteAsync(id);
                if (!result) return NotFound(new { message = "Không tìm thấy hình thức kỷ luật" });
                return Ok(new { message = "Xóa hình thức kỷ luật thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
