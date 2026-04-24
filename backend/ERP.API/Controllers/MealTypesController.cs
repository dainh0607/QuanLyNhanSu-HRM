using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Lookup;
using ERP.DTOs.Lookup;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/meal-types")]
    [Authorize]
    public class MealTypesController : ControllerBase
    {
        private readonly IMealTypeService _mealTypeService;

        public MealTypesController(IMealTypeService mealTypeService)
        {
            _mealTypeService = mealTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] string? searchTerm, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _mealTypeService.GetPagedAsync(searchTerm, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mealTypeService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mealTypeService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy loại suất ăn" });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MealTypeCreateUpdateDto dto)
        {
            try
            {
                var id = await _mealTypeService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Tạo mới loại suất ăn thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MealTypeCreateUpdateDto dto)
        {
            try
            {
                var result = await _mealTypeService.UpdateAsync(id, dto);
                if (!result) return NotFound(new { message = "Không tìm thấy loại suất ăn" });
                return Ok(new { message = "Cập nhật loại suất ăn thành công" });
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
                var result = await _mealTypeService.DeleteAsync(id);
                if (!result) return NotFound(new { message = "Không tìm thấy loại suất ăn" });
                return Ok(new { message = "Xóa loại suất ăn thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
