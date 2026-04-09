using System;
using System.Security.Claims;
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
    public class SignersController : ControllerBase
    {
        private readonly ISignerService _signerService;
        private readonly ILogger<SignersController> _logger;

        public SignersController(ISignerService signerService, ILogger<SignersController> logger)
        {
            _signerService = signerService;
            _logger = logger;
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
                _logger.LogError($"Error in GenerateOtp: {ex.Message}");
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
                _logger.LogError($"Error in VerifyOtp: {ex.Message}");
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("complete-signing")]
        [Authorize]
        public async Task<IActionResult> CompleteSigning([FromBody] CompleteSigningDto dto)
        {
            try
            {
                var tokenType = User.FindFirst(AuthSecurityConstants.TokenTypeClaimType)?.Value;
                if (!string.Equals(tokenType, AuthSecurityConstants.SignerTokenType, StringComparison.Ordinal))
                {
                    return Unauthorized(new { Message = "Chi signer token moi duoc phep hoan tat ky." });
                }

                var signerIdValue = User.FindFirst("SignerId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(signerIdValue, out var signerId))
                {
                    return Unauthorized(new { Message = "Khong xac dinh duoc nguoi ky hien tai." });
                }

                var response = await _signerService.CompleteSigningAsync(signerId, dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
