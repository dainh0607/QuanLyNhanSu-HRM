using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Lookup;
using ERP.DTOs.Lookup;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/employment-types")]
    [Authorize]
    public class EmploymentTypesController : ControllerBase
    {
        private readonly IEmploymentTypeService _employmentTypeService;

        public EmploymentTypesController(IEmploymentTypeService employmentTypeService)
        {
            _employmentTypeService = employmentTypeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] string? searchTerm, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _employmentTypeService.GetPagedAsync(searchTerm, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _employmentTypeService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _employmentTypeService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy hình thức làm việc" });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EmploymentTypeCreateUpdateDto dto)
        {
            try
            {
                var id = await _employmentTypeService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Tạo mới hình thức làm việc thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] EmploymentTypeCreateUpdateDto dto)
        {
            try
            {
                var result = await _employmentTypeService.UpdateAsync(id, dto);
                if (!result) return NotFound(new { message = "Không tìm thấy hình thức làm việc" });
                return Ok(new { message = "Cập nhật hình thức làm việc thành công" });
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
                var result = await _employmentTypeService.DeleteAsync(id);
                if (!result) return NotFound(new { message = "Không tìm thấy hình thức làm việc" });
                return Ok(new { message = "Xóa hình thức làm việc thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
