using System.Threading.Tasks;
using ERP.DTOs.Regions;
using ERP.Services.Organization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [HasPermission("organization", "read")]
    public class RegionsController : ControllerBase
    {
        private readonly IOrganizationService _orgService;

        public RegionsController(IOrganizationService orgService)
        {
            _orgService = orgService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _orgService.GetRegionsAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var res = await _orgService.GetRegionByIdAsync(id);
            if (res == null) return NotFound();
            return Ok(res);
        }

        [HttpPost]
        [HasPermission("organization", "create")]
    public async Task<IActionResult> Create([FromBody] RegionCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var res = await _orgService.CreateRegionAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = res.Id }, res);
        }

        [HttpPut("{id}")]
        [HasPermission("organization", "update")]
    public async Task<IActionResult> Update(int id, [FromBody] RegionUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var success = await _orgService.UpdateRegionAsync(id, dto);
            if (!success) return NotFound();
            return Ok(new { Message = "Updated successfully" });
        }

        [HttpDelete("{id}")]
        [HasPermission("organization", "delete")]
    public async Task<IActionResult> Delete(int id)
        {
            var success = await _orgService.DeleteRegionAsync(id);
            if (!success) return NotFound();
            return Ok(new { Message = "Deleted successfully" });
        }
    }
}
