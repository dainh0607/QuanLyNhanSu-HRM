using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.Repositories.Interfaces;
using ERP.Entities.Models;
using System.Threading.Tasks;
using System.Linq;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MetadataController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public MetadataController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("regions")]
        public async Task<IActionResult> GetRegions()
        {
            var data = await _unitOfWork.Repository<Regions>().GetAllAsync();
            return Ok(data.Select(r => new { r.Id, r.name, r.code }));
        }

        [HttpGet("branches")]
        public async Task<IActionResult> GetBranches()
        {
            var data = await _unitOfWork.Repository<Branches>().GetAllAsync();
            return Ok(data.Select(b => new { b.Id, b.name, b.code, b.region_id }));
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var data = await _unitOfWork.Repository<Departments>().GetAllAsync();
            return Ok(data.Select(d => new { d.Id, d.name, d.code, d.parent_id }));
        }

        [HttpGet("job-titles")]
        public async Task<IActionResult> GetJobTitles()
        {
            var data = await _unitOfWork.Repository<JobTitles>().GetAllAsync();
            return Ok(data.Select(j => new { j.Id, j.name, j.code }));
        }

        [HttpGet("access-groups")]
        public async Task<IActionResult> GetAccessGroups()
        {
            var data = await _unitOfWork.Repository<Roles>().GetAllAsync();
            return Ok(data.Select(r => new { r.Id, name = r.name }));
        }
    }
}
