using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Contracts;
using ERP.Services.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [HasPermission("contracts", "read")]
    public class ContractTemplatesController : ControllerBase
    {
        private readonly IContractTemplateService _templateService;

        public ContractTemplatesController(IContractTemplateService templateService)
        {
            _templateService = templateService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllActive()
        {
            var templates = await _templateService.GetAllActiveAsync();
            return Ok(templates);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var template = await _templateService.GetByIdAsync(id);
            if (template == null) return NotFound();
            return Ok(template);
        }
    }
}
