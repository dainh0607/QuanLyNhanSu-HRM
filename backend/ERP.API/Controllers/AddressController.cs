using System.Threading.Tasks;
using ERP.Services.Lookup;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;

        public AddressController(IAddressService addressService)
        {
            _addressService = addressService;
        }

        [HttpGet("provinces")]
        public async Task<IActionResult> GetProvinces()
        {
            var data = await _addressService.GetProvincesAsync();
            return Ok(data);
        }

        [HttpGet("districts/{provinceCode}")]
        public async Task<IActionResult> GetDistricts(string provinceCode)
        {
            var data = await _addressService.GetDistrictsAsync(provinceCode);
            return Ok(data);
        }

        [HttpGet("wards/{districtCode}")]
        public async Task<IActionResult> GetWards(string districtCode)
        {
            var data = await _addressService.GetWardsAsync(districtCode);
            return Ok(data);
        }

        [HttpPost("sync")]
        [Authorize(Roles = "SuperAdmin")] // Only SuperAdmin can sync
        public async Task<IActionResult> Sync()
        {
            await _addressService.SyncAddressDataAsync();
            return Ok(new { message = "Address data synchronized successfully." });
        }

        // Merged Address Endpoints
        [HttpGet("merged-provinces")]
        public async Task<IActionResult> GetMergedProvinces()
        {
            var data = await _addressService.GetMergedProvincesAsync();
            return Ok(data);
        }

        [HttpGet("merged-wards/{provinceCode}")]
        public async Task<IActionResult> GetMergedWards(string provinceCode)
        {
            var data = await _addressService.GetMergedWardsAsync(provinceCode);
            return Ok(data);
        }

        [HttpPost("sync-merged")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> SyncMerged()
        {
            await _addressService.SyncMergedAddressDataAsync();
            return Ok(new { message = "Merged address data synchronized successfully." });
        }
    }
}
