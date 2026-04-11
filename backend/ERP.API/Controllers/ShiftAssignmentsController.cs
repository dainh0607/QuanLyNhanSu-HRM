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
    }
}
