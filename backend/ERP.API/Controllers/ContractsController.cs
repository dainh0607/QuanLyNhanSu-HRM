using System.Threading.Tasks;
using ERP.DTOs.Contracts;
using ERP.Services.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContractsController : ControllerBase
    {
        private readonly IContractService _contractService;

        public ContractsController(IContractService contractService)
        {
            _contractService = contractService;
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetByEmployeeId(int employeeId)
        {
            var contracts = await _contractService.GetByEmployeeIdAsync(employeeId);
            return Ok(contracts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var contract = await _contractService.GetByIdAsync(id);
            if (contract == null) return NotFound();
            return Ok(contract);
        }

        [HttpPost]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Create([FromBody] ContractCreateDto dto)
        {
            var success = await _contractService.CreateAsync(dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Contract created successfully" });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] ContractUpdateDto dto)
        {
            var success = await _contractService.UpdateAsync(id, dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Contract updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _contractService.DeleteAsync(id);
            if (!success) return BadRequest();
            return Ok(new { Message = "Contract deleted successfully" });
        }
    }
}
