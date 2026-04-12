using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/shift-assignments")]
    [Authorize]
    public class ShiftAssignmentsController : ControllerBase
    {
        public ShiftAssignmentsController()
        {
        }

        [HttpGet("weekly")]
        public IActionResult GetWeeklySchedule([FromQuery] string weekStartDate, [FromQuery] string viewMode = "branch")
        {
            // Return empty list to resolve 404 and allow frontend mock fallback
            return Ok(new { 
                items = new List<object>(),
                weekStartDate = weekStartDate,
                viewMode = viewMode,
                totalCount = 0
            });
        }
    }
}
