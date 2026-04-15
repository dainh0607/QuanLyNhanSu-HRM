using System;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;
using ERP.Services.Attendance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/shifts")]
    [Authorize]
    [ERP.API.Authorization.HasPermission("Attendance", "View")]
    public class ShiftsController : ControllerBase
    {
        private readonly IShiftService _shiftService;

        public ShiftsController(IShiftService shiftService)
        {
            _shiftService = shiftService;
        }

        [HttpGet]
        public async Task<IActionResult> GetShifts([FromQuery] bool? isActive, [FromQuery] int? branchId)
        {
            try
            {
                var result = await _shiftService.GetShiftsAsync(isActive, branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("weekly-schedule")]
        public async Task<IActionResult> GetWeeklySchedule([FromQuery] int branchId, [FromQuery] DateTime startDate)
        {
            try
            {
                var result = await _shiftService.GetWeeklyScheduleAsync(branchId, startDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("detail")]
        public async Task<IActionResult> GetShiftAttendanceDetail([FromQuery] int employeeId, [FromQuery] DateTime date)
        {
            try
            {
                var result = await _shiftService.GetShiftAttendanceDetailAsync(employeeId, date);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("assignment")]
        [ERP.API.Authorization.HasPermission("Attendance", "Update")]
        public async Task<IActionResult> DeleteAssignment([FromQuery] int employeeId, [FromQuery] DateTime date)
        {
            try
            {
                var success = await _shiftService.DeleteShiftAssignmentAsync(employeeId, date);
                if (!success) return NotFound(new { Message = "Không tìm thấy bản ghi phân ca." });
                return Ok(new { Message = "Hủy gán ca thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost]
        [ERP.API.Authorization.HasPermission("Attendance", "Update")]
        public async Task<IActionResult> CreateShift([FromBody] ShiftCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var shiftId = await _shiftService.CreateShiftAsync(dto);
                return Ok(new { Message = "Tạo ca thành công", ShiftId = shiftId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("{id}/detail")]
        public async Task<IActionResult> GetShiftDetail(int id)
        {
            try
            {
                var result = await _shiftService.GetShiftDetailAsync(id);
                if (result == null) return NotFound(new { Message = "Không tìm thấy ca làm việc." });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("~/api/open-shifts")]
        [ERP.API.Authorization.HasPermission("Attendance", "Update")]
        public async Task<IActionResult> CreateOpenShifts([FromBody] OpenShiftCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var success = await _shiftService.CreateOpenShiftsAsync(dto);
                if (!success) return BadRequest(new { Message = "Tạo Open Shift thất bại." });
                return Ok(new { Message = "Tạo Open Shift thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("~/api/open-shifts")]
        public async Task<IActionResult> GetOpenShifts([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int? branchId = null)
        {
            try
            {
                var result = await _shiftService.GetOpenShiftsAsync(startDate, endDate, branchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
