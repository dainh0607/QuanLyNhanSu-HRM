using System.Threading.Tasks;
using ERP.DTOs.Auth;
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

        [HttpGet]
        public async Task<IActionResult> GetPagedList([FromQuery] ContractFilterDto filter)
        {
            var result = await _contractService.GetPagedListAsync(filter);
            return Ok(result);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _contractService.GetSummaryAsync();
            return Ok(summary);
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

        [HttpPost("manual")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> CreateManual([FromBody] ContractCreateDto dto)
        {
            var success = await _contractService.CreateAsync(dto);
            if (!success) return BadRequest();
            return Ok(new { Message = "Contract created successfully" });
        }

        [HttpPost("electronic/draft")]
        [Authorize(Roles = "User,Manager,Admin")]
        public async Task<IActionResult> CreateElectronicDraft([FromBody] ElectronicContractDraftDto dto)
        {
            var id = await _contractService.CreateElectronicDraftAsync(dto);
            if (id <= 0) return BadRequest();
            return Ok(new { Id = id, Message = "Electronic contract draft created successfully" });
        }

        [HttpPost("electronic/step3")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> SaveStep3Signers([FromBody] ContractStep3Dto dto)
        {
            try
            {
                var signers = await _contractService.SaveElectronicSignersAsync(dto);
                return Ok(new { Signers = signers, Message = "Signers saved successfully for Step 3" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("electronic/step4")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> SaveStep4Positions([FromBody] ContractStep4Dto dto)
        {
            try
            {
                var success = await _contractService.SaveElectronicPositionsAsync(dto);
                if (!success) return BadRequest();
                return Ok(new { Message = "Signature positions saved successfully for Step 4" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("electronic/submit")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> SubmitElectronicContract([FromBody] ContractSubmitDto dto)
        {
            try
            {
                var result = await _contractService.SubmitElectronicContractAsync(dto.ContractId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
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

        [HttpGet("export")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> Export([FromQuery] ContractFilterDto filter)
        {
            var bytes = await _contractService.ExportToCsvAsync(filter);
            return File(bytes, "text/csv", $"Contracts_{System.DateTime.Now:yyyyMMddHHmmss}.csv");
        }

        [HttpPost("bulk-delete")]
        [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> BulkDelete([FromBody] int[] ids)
        {
            var count = await _contractService.DeleteMultipleAsync(ids);
            return Ok(new { Message = $"{count} contracts deleted successfully", Count = count });
        }

        [HttpGet("preview/{id}")]
        public async Task<IActionResult> Preview(int id)
        {
            try
            {
                var tokenType = User.FindFirst(AuthSecurityConstants.TokenTypeClaimType)?.Value;
                if (string.Equals(tokenType, AuthSecurityConstants.SignerTokenType, System.StringComparison.Ordinal))
                {
                    var contractIdClaim = User.FindFirst("ContractId")?.Value;
                    if (!int.TryParse(contractIdClaim, out var signerContractId) || signerContractId != id)
                    {
                        return StatusCode(403, new { Message = "Ban khong co quyen xem tai lieu nay." });
                    }
                }

                var (content, contentType, fileName) = await _contractService.GetContractPreviewAsync(id);
                return File(content, contentType, fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
