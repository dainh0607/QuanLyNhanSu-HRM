using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.DTOs.Employees;
using ERP.Services.Employees;
using System.Threading.Tasks;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/employees")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeesController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPagedList([FromQuery] EmployeeFilterDto filter)
        {
            var result = await _employeeService.GetPagedListAsync(filter);
            return Ok(result);
        }

        [HttpGet("{id}/full-profile")]
        public async Task<IActionResult> GetFullProfile(int id)
        {
            var result = await _employeeService.GetFullProfileAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _employeeService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("code/{code}")]
        public async Task<IActionResult> GetByCode(string code)
        {
            var result = await _employeeService.GetByCodeAsync(code);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("next-code")]
        public async Task<IActionResult> GetNextCode([FromQuery] string prefix = "NV")
        {
            var result = await _employeeService.GenerateNextEmployeeCodeAsync(prefix);
            return Ok(new { EmployeeCode = result });
        }

        [HttpGet("returning/{id}")]
        public async Task<IActionResult> GetReturningCode(int id, [FromQuery] string prefix = "NV")
        {
            var result = await _employeeService.GetCodeForReturningEmployeeAsync(id, prefix);
            return Ok(new { EmployeeCode = result });
        }

        [HttpGet("export")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Export()
        {
            var result = await _employeeService.ExportEmployeesToCsvAsync();
            return File(result, "text/csv", $"Employees_{System.DateTime.Now:yyyyMMdd}.csv");
        }

        [HttpPost]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Create([FromBody] EmployeeCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _employeeService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] EmployeeUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _employeeService.UpdateAsync(id, dto);
            if (!success) return NotFound();

            return Ok(new { Message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _employeeService.DeleteAsync(id);
            if (!success) return NotFound();

            return Ok(new { Message = "Xóa thành công (Soft delete)" });
        }
    }
}
