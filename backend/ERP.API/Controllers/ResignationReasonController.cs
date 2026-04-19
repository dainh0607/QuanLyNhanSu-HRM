using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.Entities;
using ERP.Entities.Models;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/resignation-reasons")]
    [Authorize]
    public class ResignationReasonController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResignationReasonController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reasons = await _context.ResignationReasons
                .OrderBy(r => r.reason_name)
                .ToListAsync();
            return Ok(reasons);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ResignationReasons model)
        {
            if (string.IsNullOrWhiteSpace(model.reason_name))
                return BadRequest("Tên lý do không được để trống.");

            _context.ResignationReasons.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }
    }
}
