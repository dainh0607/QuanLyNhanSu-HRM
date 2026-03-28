using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

            var user = await _authService.GetUserByUidAsync(uid);
            if (user == null)
            {
                return NotFound(new { Message = "User not found in system" });
            }

            return Ok(user);
        }

        [HttpPost("verify-token")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyToken([FromBody] string idToken)
        {
            if (string.IsNullOrEmpty(idToken))
            {
                return BadRequest("Token is required");
            }

            var uid = await _authService.VerifyTokenAsync(idToken);
            
            if (uid == null)
            {
                return Unauthorized(new { Message = "Invalid token" });
            }

            return Ok(new { Uid = uid, Message = "Token is valid" });
        }

        [HttpPost("sync")]
        [AllowAnonymous] // Changed to AllowAnonymous for easier dev sync, but could be restricted
        public async Task<IActionResult> SyncUsers()
        {
            try
            {
                var count = await _authService.SyncFirebaseUsersAsync();
                return Ok(new { Message = $"Successfully synced {count} users from Firebase.", Count = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Error syncing users", Error = ex.Message });
            }
        }
    }
}
