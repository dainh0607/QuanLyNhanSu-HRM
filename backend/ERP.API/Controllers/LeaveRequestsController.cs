using System;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;
using ERP.Services.Attendance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;
using System.Security.Claims;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/leave-requests")]
    [Authorize]
    [HasPermission("leave", "read")]
    public class LeaveRequestsController : ControllerBase
    {
        private readonly ILeaveRequestService _leaveService;

        public LeaveRequestsController(ILeaveRequestService leaveService)
        {
            _leaveService = leaveService;
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

        [HttpGet]
        public async Task<IActionResult> GetLeaveRequests([FromQuery] string? status, [FromQuery] int skip = 0, [FromQuery] int take = 10)
        {
            try
            {
                var result = await _leaveService.GetLeaveRequestsAsync(status, skip, take);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _leaveService.GetLeaveRequestByIdAsync(id);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateLeaveRequest([FromBody] LeaveRequestCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var success = await _leaveService.CreateLeaveRequestAsync(dto);
                if (!success) return BadRequest(new { Message = "Gửi yêu cầu nghỉ phép thất bại." });
                return Ok(new { Message = "Đã gửi yêu cầu nghỉ phép thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("dependent-data")]
        [HasPermission("leave", "read")]
        public async Task<IActionResult> GetDependentData([FromQuery] int branchId, [FromQuery] int excludeEmployeeId)
        {
            try
            {
                var result = await _leaveService.GetDependentDataAsync(branchId, excludeEmployeeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("matrix")]
        [HasPermission("leave", "create")]
        public async Task<IActionResult> CreateMatrixLeaveRequest([FromBody] LeaveRequestCreateMatrixDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var creatorId = GetCurrentUserId();
                var success = await _leaveService.CreateMatrixLeaveRequestAsync(dto, creatorId);
                if (!success) return BadRequest(new { Message = "Gửi yêu cầu nghỉ phép thất bại." });
                return Ok(new { Message = "Đã gửi yêu cầu nghỉ phép thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}/approve")]
        [HasPermission("leave", "approve")]
        public async Task<IActionResult> ApproveLeaveRequest(int id)
        {
            try
            {
                var managerId = GetCurrentUserId();
                var success = await _leaveService.ApproveLeaveRequestAsync(id, managerId);
                if (!success) return BadRequest(new { Message = "Phê duyệt thất bại." });
                return Ok(new { Message = "Đã phê duyệt yêu cầu nghỉ phép." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}/reject")]
        [HasPermission("leave", "approve")]
        public async Task<IActionResult> RejectLeaveRequest(int id, [FromBody] string reason)
        {
            try
            {
                var managerId = GetCurrentUserId();
                var success = await _leaveService.RejectLeaveRequestAsync(id, managerId, reason);
                if (!success) return BadRequest(new { Message = "Từ chối thất bại." });
                return Ok(new { Message = "Đã từ chối yêu cầu nghỉ phép." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("balance/{employeeId}")]
        public async Task<IActionResult> GetLeaveBalance(int employeeId)
        {
            try
            {
                var result = await _leaveService.GetLeaveBalanceAsync(employeeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
