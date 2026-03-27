using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using System.Security.Claims;
using ERP.DTOs.Auth;
using ERP.Services.Auth;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("sign-up")]
        [AllowAnonymous]
        public async Task<IActionResult> SignUp([FromBody] SignUpDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.SignUpAsync(dto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(dto);
            
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var uid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(uid))
            {
                return Unauthorized();
            }

            try
            {
                var userRecord = await FirebaseAuth.DefaultInstance.GetUserAsync(uid);
                return Ok(new
                {
                    Uid = userRecord.Uid,
                    Email = userRecord.Email,
                    DisplayName = userRecord.DisplayName,
                    PhotoUrl = userRecord.PhotoUrl
                });
            }
            catch (FirebaseAuthException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("verify-token")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyToken([FromBody] string idToken)
        {
            try
            {
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                var uid = decodedToken.Uid;
                
                return Ok(new { Uid = uid, Message = "Token is valid" });
            }
            catch (FirebaseAuthException ex)
            {
                return Unauthorized(new { Message = "Invalid token", Error = ex.Message });
            }
        }
    }
}
