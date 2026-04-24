using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Lookup;
using ERP.DTOs.Lookup;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/majors")]
    [Authorize]
    public class MajorsController : ControllerBase
    {
        private readonly IMajorService _majorService;

        public MajorsController(IMajorService majorService)
        {
            _majorService = majorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] string? searchTerm, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _majorService.GetPagedAsync(searchTerm, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _majorService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _majorService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy chuyên ngành" });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MajorCreateUpdateDto dto)
        {
            try
            {
                var id = await _majorService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Tạo mới chuyên ngành thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MajorCreateUpdateDto dto)
        {
            try
            {
                var result = await _majorService.UpdateAsync(id, dto);
                if (!result) return NotFound(new { message = "Không tìm thấy chuyên ngành" });
                return Ok(new { message = "Cập nhật chuyên ngành thành công" });
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
                var result = await _majorService.DeleteAsync(id);
                if (!result) return NotFound(new { message = "Không tìm thấy chuyên ngành" });
                return Ok(new { message = "Xóa chuyên ngành thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
