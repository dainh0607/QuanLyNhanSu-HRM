using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;
using ERP.Services.Attendance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [HasPermission("attendance", "read")]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không thể xác định thông tin người dùng.");
            }
            return userId;
        }

        [HttpPost("check-in")]
        [Authorize]
        public async Task<IActionResult> CheckIn([FromBody] AttendanceCheckInDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _attendanceService.CheckInAsync(userId, dto);
                if (!success) return BadRequest(new { Message = "Check-in thất bại." });
                return Ok(new { Message = "Check-in thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("check-out")]
        [Authorize]
        public async Task<IActionResult> CheckOut([FromBody] AttendanceCheckInDto dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _attendanceService.CheckOutAsync(userId, dto);
                if (!success) return BadRequest(new { Message = "Check-out thất bại." });
                return Ok(new { Message = "Check-out thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodayAttendance([FromQuery] int? employeeId)
        {
            try
            {
                // If admin/manager, can view others. If user, only self.
                // For now, simple implementation.
                var idToFetch = employeeId ?? 0; // Needs logic to map userId to employeeId if not provided
                
                // Simplified: just return today's records for a specific employee
                if (idToFetch <= 0) return BadRequest(new { Message = "Thiếu EmployeeId." });

                var records = await _attendanceService.GetTodayAttendanceAsync(idToFetch);
                return Ok(records);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("history/{employeeId}")]
        [HasPermission("attendance", "read")]
        public async Task<IActionResult> GetAttendanceHistory(int employeeId, [FromQuery] int skip = 0, [FromQuery] int take = 10)
        {
            try
            {
                var history = await _attendanceService.GetAttendanceHistoryAsync(employeeId, skip, take);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetAttendanceSummary([FromQuery] int employeeId, [FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                var summary = await _attendanceService.GetAttendanceSummaryAsync(employeeId, month, year);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("monthly/{employeeId}")]
        public async Task<IActionResult> GetMonthlyAttendance(int employeeId, [FromQuery] int month, [FromQuery] int year)
        {
            try
            {
                var records = await _attendanceService.GetMonthlyAttendanceAsync(employeeId, month, year);
                return Ok(records);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("manual-adjustment")]
        [HasPermission("attendance", "update")]
        public async Task<IActionResult> ManualAdjustment([FromBody] AttendanceAdjustmentDto dto)
        {
            try
            {
                var modifierId = GetCurrentUserId();
                var success = await _attendanceService.ManualAdjustmentAsync(modifierId, dto);
                if (!success) return BadRequest(new { Message = "Điều chỉnh chấm công thất bại." });
                return Ok(new { Message = "Điều chỉnh chấm công thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
