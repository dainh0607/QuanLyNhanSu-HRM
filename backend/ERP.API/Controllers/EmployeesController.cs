using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.DTOs.Employees;
using ERP.Services.Employees;
using ERP.Services.Authorization;
using ERP.API.Extensions;
using ERP.API.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/employees")]
    [Authorize]
    [HasPermission("Employee", "View")]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly IEmployeeLifecycleService _lifecycleService;
        private readonly ERP.Services.Authorization.IAuthorizationService _authService;

        public EmployeesController(IEmployeeService employeeService, 
            IEmployeeLifecycleService lifecycleService,
            ERP.Services.Authorization.IAuthorizationService authService)
        {
            _employeeService = employeeService;
            _lifecycleService = lifecycleService;
            _authService = authService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPagedList([FromQuery] EmployeeFilterDto filter)
        {
            var result = await _employeeService.GetPagedListAsync(filter);
            return Ok(result);
        }

        [HttpGet("active-by-branch")]
        public async Task<IActionResult> GetActiveByBranch([FromQuery] int branchId)
        {
            var result = await _employeeService.GetActiveByBranchAsync(branchId);
            return Ok(result);
        }

        [HttpGet("{id}/full-profile")]
        [HasPermission("Employee", "View")]
        public async Task<IActionResult> GetFullProfile(int id)
        {
            var result = await _employeeService.GetFullProfileAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [HasPermission("Employee", "View")]
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
        [HasPermission("Employee", "Export")]
        public async Task<IActionResult> Export([FromQuery] EmployeeFilterDto filter, [FromQuery(Name = "columns")] string[]? columns)
        {
            var result = await _employeeService.ExportEmployeesToCsvAsync(filter, columns);
            return File(result, "text/csv", $"Employees_{System.DateTime.Now:yyyyMMdd}.csv");
        }

        [HttpPost]
        [HasPermission("Employee", "Create")]
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

        [HttpPost("bulk")]
        [HasPermission("Employee", "Create")]
        public async Task<IActionResult> BulkCreate([FromBody] EmployeeBulkCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var count = await _employeeService.CreateBulkAsync(dto);
                return Ok(new { Message = $"Đã thêm thành công {count} nhân viên", Count = count });
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [HasPermission("Employee", "Update")]
        public async Task<IActionResult> Update(int id, [FromBody] EmployeeUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _employeeService.UpdateAsync(id, dto);
            if (!success) return NotFound();

            return Ok(new { Message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        [HasPermission("Employee", "Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _employeeService.DeleteAsync(id);
            if (!success) return NotFound();

            return Ok(new { Message = "Xóa thành công (Soft delete)" });
        }

        [HttpPut("{id}/resignation")]
        [HasPermission("Employee", "Update")]
        public async Task<IActionResult> Resign(int id, [FromBody] ResignationRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _lifecycleService.ProcessResignationAsync(id, dto);
            if (!success) return BadRequest(new { Message = "Không thể xử lý nghỉ việc" });

            return Ok(new { Message = "Xử lý nghỉ việc thành công" });
        }

        [HttpPut("{id}/promotion")]
        [HasPermission("Employee", "Update")]
        public async Task<IActionResult> Promote(int id, [FromBody] PromotionRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _lifecycleService.ProcessPromotionAsync(id, dto);
            if (!success) return BadRequest(new { Message = "Không thể xử lý thăng tiến" });

            return Ok(new { Message = "Xử lý thăng tiến thành công" });
        }
    }
}
