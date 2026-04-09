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

        /// <summary>
        /// Signs/stamps a PDF document with a signature image at specified coordinates
        /// </summary>
        /// <remarks>
        /// This endpoint accepts a signature image and embeds it into a PDF at the specified position.
        /// 
        /// Example request body:
        /// {
        ///   "signerId": 1,
        ///   "signatureImageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        ///   "pageNumber": 1,
        ///   "x": 100,
        ///   "y": 100,
        ///   "width": 100,
        ///   "height": 50,
        ///   "note": "Signed on 27/04/2026"
        /// }
        /// </remarks>
        [HttpPost("sign-document")]
        [Authorize]
        public async Task<IActionResult> SignDocument([FromBody] SignDocumentDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { Message = "Request body is required" });

                if (string.IsNullOrWhiteSpace(dto.SignatureImageBase64))
                    return BadRequest(new { Message = "Signature image is required" });

                var result = await _signerService.SignDocumentAsync(dto);

                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Validation error in SignDocument: {ex.Message}");
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in SignDocument: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { Message = "An error occurred while signing the document", Error = ex.Message });
            }
        }
    }
}
