using System;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;
using ERP.Services.Employees;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Authorization;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SignaturesController : ControllerBase
    {
        private readonly ISignatureService _signatureService;

        public SignaturesController(ISignatureService signatureService)
        {
            _signatureService = signatureService;
        }

        [HttpGet("employee/{employeeId}")]
        [HasPermission("employees", "read")]
        public async Task<IActionResult> GetByEmployeeId(int employeeId)
        {
            var result = await _signatureService.GetSignaturesByEmployeeIdAsync(employeeId);
            return Ok(result);
        }

        [HttpPost]
        [HasPermission("employees", "update")]
        public async Task<IActionResult> Create([FromBody] SignatureCreateDto dto)
        {
            try
            {
                var success = await _signatureService.CreateSignatureAsync(dto);
                if (!success) return BadRequest(new { Message = "Tạo chữ ký thất bại." });
                return Ok(new { Message = "Chữ ký đã được tạo thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}/set-default")]
        [HasPermission("employees", "update")]
        public async Task<IActionResult> SetDefault(int id, [FromQuery] int employeeId)
        {
            var success = await _signatureService.SetDefaultSignatureAsync(id, employeeId);
            if (!success) return BadRequest();
            return Ok(new { Message = "Đã cập nhật chữ ký mặc định." });
        }

        [HttpDelete("{id}")]
        [HasPermission("employees", "update")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _signatureService.DeleteSignatureAsync(id);
            if (!success) return BadRequest();
            return Ok(new { Message = "Đã xóa chữ ký thành công." });
        }
    }
}
