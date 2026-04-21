using System;
using System.Threading.Tasks;
using ERP.DTOs.Employees;
using ERP.Services.Employees;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/employment-history")]
    public class EmploymentHistoryController : ControllerBase
    {
        private readonly IEmploymentHistoryService _historyService;

        public EmploymentHistoryController(IEmploymentHistoryService historyService)
        {
            _historyService = historyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPagedList([FromQuery] EmploymentHistoryFilterDto filter)
        {
            var result = await _historyService.GetPagedListAsync(filter);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _historyService.DeleteAsync(id);
            if (!result) return NotFound(new { message = "Không tìm thấy bản ghi lịch sử." });
            return Ok(new { message = "Đã xóa bản ghi thành công." });
        }

        [HttpDelete("bulk")]
        public async Task<IActionResult> BulkDelete([FromBody] int[] ids)
        {
            var result = await _historyService.BulkDeleteAsync(ids);
            if (!result) return BadRequest(new { message = "Xóa hàng loạt thất bại hoặc không có ID hợp lệ." });
            return Ok(new { message = "Đã xóa các bản ghi thành công." });
        }

        [HttpGet("export")]
        public async Task<IActionResult> Export([FromQuery] EmploymentHistoryFilterDto filter)
        {
            var content = await _historyService.ExportExcelAsync(filter);
            var fileName = $"LichSuBienDong_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
            return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
    }
}
