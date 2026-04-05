using System;
using System.Threading.Tasks;
using ERP.DTOs.Contracts;
using ERP.Services.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SignersController : ControllerBase
    {
        private readonly ISignerService _signerService;

        public SignersController(ISignerService signerService)
        {
            _signerService = signerService;
        }

        [HttpPost("generate-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> GenerateOtp([FromBody] GenerateOtpDto dto)
        {
            try
            {
                var result = await _signerService.GenerateOtpAsync(dto);
                if (result)
                {
                    return Ok(new { Message = "Mã OTP đã được gửi đến email của bạn." });
                }
                return BadRequest(new { Message = "Không thể gửi OTP." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("verify-otp")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            try
            {
                var response = await _signerService.VerifyOtpAsync(dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
