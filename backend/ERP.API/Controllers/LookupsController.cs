using System.Threading.Tasks;
using ERP.Services.Lookup;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LookupsController : ControllerBase
    {
        private readonly ILookupService _lookupService;

        public LookupsController(ILookupService lookupService)
        {
            _lookupService = lookupService;
        }

        [HttpGet("genders")]
        public async Task<IActionResult> GetGenders() => Ok(await _lookupService.GetGendersAsync());

        [HttpGet("marital-statuses")]
        public async Task<IActionResult> GetMaritalStatuses() => Ok(await _lookupService.GetMaritalStatusesAsync());
    }
}
