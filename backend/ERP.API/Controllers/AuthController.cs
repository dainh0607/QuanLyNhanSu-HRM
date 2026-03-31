using System.Security.Claims;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;
        private readonly IFirebaseService _firebaseService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService, 
            IUserService userService, 
            IFirebaseService firebaseService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _userService = userService;
            _firebaseService = firebaseService;
            _logger = logger;
        }

        [HttpPost("sign-up")]
        [AllowAnonymous]
        public async Task<IActionResult> SignUp([FromBody] SignUpDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.SignUpAsync(dto);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(dto);
            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new { Message = "User not found in system" });

            return Ok(user);
        }

        [HttpPost("verify-token")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyToken([FromBody] string idToken)
        {
            if (string.IsNullOrEmpty(idToken))
                return BadRequest("Token is required");

            var uid = await _firebaseService.VerifyIdTokenAsync(idToken);
            if (uid == null)
                return Unauthorized(new { Message = "Invalid token" });

            return Ok(new { Uid = uid, Message = "Token is valid" });
        }
    }
}
