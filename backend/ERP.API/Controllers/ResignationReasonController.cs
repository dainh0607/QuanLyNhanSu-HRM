using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Lookup;
using ERP.DTOs.Lookup;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/resignation-reasons")]
    [Authorize]
    public class ResignationReasonController : ControllerBase
    {
        private readonly IResignationReasonService _resignationReasonService;

        public ResignationReasonController(IResignationReasonService resignationReasonService)
        {
            _resignationReasonService = resignationReasonService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] string? searchTerm, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _resignationReasonService.GetPagedAsync(searchTerm, pageIndex, pageSize);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _resignationReasonService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _resignationReasonService.GetByIdAsync(id);
            if (result == null) return NotFound(new { message = "Không tìm thấy lý do nghỉ việc" });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ResignationReasonCreateUpdateDto dto)
        {
            try
            {
                var id = await _resignationReasonService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, new { id, message = "Tạo mới lý do nghỉ việc thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ResignationReasonCreateUpdateDto dto)
        {
            try
            {
                var result = await _resignationReasonService.UpdateAsync(id, dto);
                if (!result) return NotFound(new { message = "Không tìm thấy lý do nghỉ việc" });
                return Ok(new { message = "Cập nhật lý do nghỉ việc thành công" });
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
                var result = await _resignationReasonService.DeleteAsync(id);
                if (!result) return NotFound(new { message = "Không tìm thấy lý do nghỉ việc" });
                return Ok(new { message = "Xóa lý do nghỉ việc thành công" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
