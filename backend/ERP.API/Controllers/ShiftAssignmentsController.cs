using System;
using System.Threading.Tasks;
using ERP.Services.Attendance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/shift-assignments")]
    [Authorize]
    public class ShiftAssignmentsController : ControllerBase
    {
        private readonly IShiftAssignmentService _assignmentService;

        public ShiftAssignmentsController(IShiftAssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        [HttpGet("weekly")]
        public async Task<IActionResult> GetWeeklySchedule(
            [FromQuery] string weekStartDate,
            [FromQuery] int? branchId = null,
            [FromQuery] int? departmentId = null,
            [FromQuery] string? searchTerm = null)
        {
            try
            {
                var result = await _assignmentService.GetWeeklyScheduleAsync(weekStartDate, branchId, departmentId, searchTerm);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateAssignment([FromBody] ERP.DTOs.Attendance.ShiftAssignmentCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var id = await _assignmentService.CreateAssignmentAsync(dto);
                return Ok(new { Message = "Gán ca làm thành công.", AssignmentId = id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            try
            {
                var success = await _assignmentService.DeleteAssignmentByIdAsync(id);
                if (!success) return NotFound(new { Message = "Không tìm thấy phân ca." });
                return Ok(new { Message = "Xóa phân ca thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("{id}/refresh-attendance")]
        public async Task<IActionResult> RefreshAttendance(int id)
        {
            try
            {
                var success = await _assignmentService.RefreshAttendanceAsync(id);
                if (!success) return NotFound(new { Message = "Không tìm thấy phân ca." });
                return Ok(new { Message = "Làm mới dữ liệu chấm công thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
