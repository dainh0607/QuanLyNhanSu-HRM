using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Settings;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/settings/employee-fields")]
    [Authorize]
    public class EmployeeFieldsController : ControllerBase
    {
        private readonly ISystemFieldService _systemFieldService;

        public EmployeeFieldsController(ISystemFieldService systemFieldService)
        {
            _systemFieldService = systemFieldService;
        }

        [HttpGet("default")]
        public async Task<IActionResult> GetDefaultFields()
        {
            var result = await _systemFieldService.GetDefaultFieldsAsync();
            return Ok(result);
        }
    }
}
