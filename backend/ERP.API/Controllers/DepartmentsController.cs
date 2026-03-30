using System.Threading.Tasks;
using ERP.DTOs.Departments;
using ERP.Services.Organization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly IOrganizationService _orgService;

        public DepartmentsController(IOrganizationService orgService)
        {
            _orgService = orgService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _orgService.GetDepartmentsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var res = await _orgService.GetDepartmentByIdAsync(id);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Create([FromBody] DepartmentCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _orgService.CreateDepartmentAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = res.Id }, res);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] DepartmentUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var success = await _orgService.UpdateDepartmentAsync(id, dto);
            if (!success) return NotFound();
            return Ok(new { Message = "Updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _orgService.DeleteDepartmentAsync(id);
            if (!success) return NotFound();
            return Ok(new { Message = "Deleted successfully" });
        }
    }
}
