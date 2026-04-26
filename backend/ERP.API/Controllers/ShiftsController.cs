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
    [ERP.API.Authorization.HasPermission("attendance", "read")]
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
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " Inner error: " + ex.InnerException.Message;
                }
                return BadRequest(new { Message = message });
            }
        }

        // Shift Configuration Management APIs
        
        [HttpGet("list")]
        public async Task<IActionResult> GetShiftList([FromQuery] string? search, [FromQuery] TimeSpan? startTime, [FromQuery] TimeSpan? endTime, [FromQuery] bool? isActive, [FromQuery] int skip = 0, [FromQuery] int take = 10)
        {
            try
            {
                var result = await _shiftService.GetShiftListAsync(search, startTime, endTime, isActive, skip, take);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " Inner error: " + ex.InnerException.Message;
                }
                return BadRequest(new { Message = message });
            }
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportShiftList([FromQuery] string? search, [FromQuery] TimeSpan? startTime, [FromQuery] TimeSpan? endTime, [FromQuery] bool? isActive)
        {
            try
            {
                var fileBytes = await _shiftService.ExportShiftListAsync(search, startTime, endTime, isActive);
                var fileName = $"DanhSachCa_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " Inner error: " + ex.InnerException.Message;
                }
                return BadRequest(new { Message = message });
            }
        }

        [HttpPut("{id}")]
        [ERP.API.Authorization.HasPermission("attendance", "update")]
        public async Task<IActionResult> UpdateShift(int id, [FromBody] ShiftUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var success = await _shiftService.UpdateShiftAsync(id, dto);
                if (!success) return BadRequest(new { Message = "Cập nhật ca làm việc thất bại." });
                return Ok(new { Message = "Đã cập nhật ca làm việc thành công." });
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " Inner error: " + ex.InnerException.Message;
                }
                return BadRequest(new { Message = message });
            }
        }

        [HttpDelete("{id}")]
        [ERP.API.Authorization.HasPermission("attendance", "update")]
        public async Task<IActionResult> DeleteOrDeactivateShift(int id)
        {
            try
            {
                var success = await _shiftService.DeleteOrDeactivateShiftAsync(id);
                if (!success) return BadRequest(new { Message = "Xóa/Ngừng hoạt động ca làm việc thất bại." });
                return Ok(new { Message = "Đã thay đổi trạng thái ca làm việc thành công." });
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " Inner error: " + ex.InnerException.Message;
                }
                return BadRequest(new { Message = message });
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
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " Inner error: " + ex.InnerException.Message;
                }
                return BadRequest(new { Message = message });
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
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " Inner error: " + ex.InnerException.Message;
                }
                return BadRequest(new { Message = message });
            }
        }

        [HttpDelete("assignment")]
        [ERP.API.Authorization.HasPermission("attendance", "update")]
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
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " Inner error: " + ex.InnerException.Message;
                }
                return BadRequest(new { Message = message });
            }
        }

        [HttpPost]
        [ERP.API.Authorization.HasPermission("attendance", "update")]
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
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " Inner error: " + ex.InnerException.Message;
                }
                return BadRequest(new { Message = message });
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
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " Inner error: " + ex.InnerException.Message;
                }
                return BadRequest(new { Message = message });
            }
        }

        [HttpPost("~/api/open-shifts")]
        [ERP.API.Authorization.HasPermission("attendance", "update")]
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
                var message = ex.Message;
                if (ex.InnerException != null)
                {
                    message += " | Inner: " + ex.InnerException.Message;
                    if (ex.InnerException.InnerException != null)
                    {
                        message += " | Root: " + ex.InnerException.InnerException.Message;
                    }
                }
                return BadRequest(new { Message = message });
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

        [HttpPost("register")]
        public async Task<IActionResult> RegisterShift([FromBody] ShiftAssignmentCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var success = await _shiftService.RegisterShiftAsync(dto);
                if (!success) return BadRequest(new { Message = "Đăng ký ca thất bại." });
                return Ok(new { Message = "Đăng ký ca thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
