using System;
using System.Threading.Tasks;
using ERP.Services.Attendance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/shift-assignments")]
    [Authorize]
    [HasPermission("Attendance", "Manage")]
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
            [FromQuery] string? searchTerm = null,
            [FromQuery] int? regionId = null,
            [FromQuery] int? jobTitleId = null,
            [FromQuery] int? accessGroupId = null,
            [FromQuery] string? genderCode = null,
            [FromQuery] string? employeeStatus = "active")
        {
            try
            {
                var result = await _assignmentService.GetWeeklyScheduleAsync(
                    weekStartDate, 
                    branchId, 
                    departmentId, 
                    searchTerm, 
                    regionId, 
                    jobTitleId, 
                    accessGroupId, 
                    genderCode, 
                    employeeStatus);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost]
        [HasPermission("Attendance", "Update")]
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
        [HasPermission("Attendance", "Update")]
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

        [HttpPost("copy")]
        [HasPermission("Attendance", "Update")]
        public async Task<IActionResult> CopyAssignments([FromBody] ERP.DTOs.Attendance.ShiftAssignmentCopyDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _assignmentService.CopyAssignmentsAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("{id}/refresh-attendance")]
        [HasPermission("Attendance", "Update")]
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

        [HttpPost("bulk-publish")]
        [HasPermission("Attendance", "Update")]
        public async Task<IActionResult> BulkPublish([FromBody] ERP.DTOs.Attendance.ShiftBulkActionDto dto)
        {
            try
            {
                var result = await _assignmentService.PublishAssignmentsAsync(dto.WeekStartDate, dto.AssignmentIds);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("bulk-approve")]
        [HasPermission("Attendance", "Approve")]
        public async Task<IActionResult> BulkApprove([FromBody] ERP.DTOs.Attendance.ShiftBulkActionDto dto)
        {
            try
            {
                var result = await _assignmentService.ApproveAssignmentsAsync(dto.WeekStartDate, dto.AssignmentIds);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("bulk-publish-approve")]
        [HasPermission("Attendance", "Approve")]
        public async Task<IActionResult> BulkPublishAndApprove([FromBody] ERP.DTOs.Attendance.ShiftBulkActionDto dto)
        {
            try
            {
                var result = await _assignmentService.PublishAndApproveAssignmentsAsync(dto.WeekStartDate, dto.AssignmentIds);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("bulk-delete-unconfirmed")]
        [HasPermission("Attendance", "Update")]
        public async Task<IActionResult> BulkDeleteUnconfirmed([FromBody] ERP.DTOs.Attendance.ShiftBulkActionDto dto)
        {
            try
            {
                var result = await _assignmentService.DeleteUnconfirmedAssignmentsAsync(dto.WeekStartDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("bulk-update-status")]
        [HasPermission("Attendance", "Update")]
        public async Task<IActionResult> BulkUpdateStatus([FromBody] ERP.DTOs.Attendance.ShiftBulkUpdateStatusDto dto)
        {
            try
            {
                var result = await _assignmentService.UpdateShiftStatusAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("counters")]
        public async Task<IActionResult> GetShiftCounters([FromQuery] string startDate, [FromQuery] string endDate, [FromQuery] int? branchId = null)
        {
            try
            {
                var result = await _assignmentService.GetShiftCountersAsync(startDate, endDate, branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
