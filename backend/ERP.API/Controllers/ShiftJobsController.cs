using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;
using ERP.Services.Attendance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/shift-jobs")]
    public class ShiftJobsController : ControllerBase
    {
        private readonly IShiftJobService _shiftJobService;

        public ShiftJobsController(IShiftJobService shiftJobService)
        {
            _shiftJobService = shiftJobService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ShiftJobDto>>> GetAll()
        {
            var jobs = await _shiftJobService.GetAllAsync();
            return Ok(jobs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ShiftJobDto>> GetById(int id)
        {
            var job = await _shiftJobService.GetByIdAsync(id);
            if (job == null) return NotFound();
            return Ok(job);
        }

        [HttpPost]
        public async Task<ActionResult<int>> Create(CreateShiftJobDto dto)
        {
            var id = await _shiftJobService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateShiftJobDto dto)
        {
            var success = await _shiftJobService.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _shiftJobService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPost("quick-match-employees")]
        public async Task<ActionResult<QuickMatchEmployeesResponseDto>> QuickMatchEmployees(QuickMatchEmployeesRequestDto dto)
        {
            var result = await _shiftJobService.QuickMatchEmployeesAsync(dto);
            return Ok(result);
        }
    }
}
