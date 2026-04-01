using Microsoft.IdentityModel.JsonWebTokens;
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
        private readonly IFirebaseService _firebaseService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public AuthController(
            IAuthService authService,
            IFirebaseService firebaseService,
            ILogger<AuthController> logger,
            IConfiguration configuration,
            IWebHostEnvironment environment)
        {
            _authService = authService;
            _firebaseService = firebaseService;
            _logger = logger;
            _configuration = configuration;
            _environment = environment;
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

            var result = await _authService.LoginAsync(dto, BuildSessionContext());
            if (!result.Success)
                return Unauthorized(result);

            Response.Headers.CacheControl = "no-store";
            WriteSessionCookies(result);
            return Ok(CreateClientAuthResponse(result));
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (!int.TryParse(userIdValue, out var userId))
            {
                return Unauthorized();
            }

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { Message = "User not found in system" });

            return Ok(user);
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshSession()
        {
            if (!Request.Cookies.TryGetValue(AuthSecurityConstants.RefreshTokenCookieName, out var refreshToken) ||
                string.IsNullOrWhiteSpace(refreshToken))
            {
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Phien dang nhap da het han"
                });
            }

            var result = await _authService.RefreshSessionAsync(refreshToken, BuildSessionContext());
            if (!result.Success)
            {
                ClearSessionCookies();
                return Unauthorized(CreateClientAuthResponse(result));
            }

            Response.Headers.CacheControl = "no-store";
            WriteSessionCookies(result);
            return Ok(CreateClientAuthResponse(result));
        }

        [HttpPost("logout")]
        [AllowAnonymous]
        public async Task<IActionResult> Logout()
        {
            if (Request.Cookies.TryGetValue(AuthSecurityConstants.RefreshTokenCookieName, out var refreshToken) &&
                !string.IsNullOrWhiteSpace(refreshToken))
            {
                await _authService.RevokeSessionAsync(refreshToken);
            }

            ClearSessionCookies();
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Dang xuat thanh cong"
            });
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

        [HttpPost("sync")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SyncUsers()
        {
            if (!_environment.IsDevelopment())
            {
                return NotFound();
            }

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

        [HttpPost("invite-staff")]
        [Authorize] // Temporary Authorize, ideally [Authorize(Roles = "Manager,Admin")]
        public async Task<IActionResult> InviteStaff([FromBody] PreRegisterStaffDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.PreRegisterStaffAsync(dto);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// DANGEROUS: Wipes all users from the Firebase project. 
        /// Use only for resetting development environment.
        /// </summary>
        [HttpDelete("nuke-all-users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAllFirebaseUsers()
        {
            if (!_environment.IsDevelopment())
            {
                return NotFound();
            }

            try
            {
                var auth = FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance;
                var users = auth.ListUsersAsync(null);
                int count = 0;

                await foreach (var user in users)
                {
                    await auth.DeleteUserAsync(user.Uid);
                    count++;
                }

                return Ok(new { Message = $"Successfully wiped {count} users from Firebase.", Count = count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error wiping Firebase users");
                return StatusCode(500, new { Message = "Error wiping users", Error = ex.Message });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Sub)?.Value;

            if (!int.TryParse(userIdValue, out var userId))
            {
                return Unauthorized(new { Message = "Không thể xác định danh tính người dùng." });
            }

            var result = await _authService.ChangePasswordAsync(userId, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        private void WriteSessionCookies(AuthResponseDto result)
        {
            if (string.IsNullOrWhiteSpace(result.IdToken) ||
                string.IsNullOrWhiteSpace(result.RefreshToken) ||
                string.IsNullOrWhiteSpace(result.CsrfToken))
            {
                return;
            }

            Response.Cookies.Append(
                AuthSecurityConstants.AccessTokenCookieName,
                result.IdToken,
                CreateAuthCookieOptions(DateTimeOffset.UtcNow.AddSeconds(result.ExpiresIn > 0 ? result.ExpiresIn : 900), "/"));

            Response.Cookies.Append(
                AuthSecurityConstants.RefreshTokenCookieName,
                result.RefreshToken,
                CreateAuthCookieOptions(DateTimeOffset.UtcNow.AddDays(GetRefreshTokenExpiryInDays()), "/api/auth"));

            Response.Cookies.Append(
                AuthSecurityConstants.CsrfCookieName,
                result.CsrfToken,
                CreateCsrfCookieOptions(DateTimeOffset.UtcNow.AddDays(GetRefreshTokenExpiryInDays())));
        }

        private void ClearSessionCookies()
        {
            var accessDeleteOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = IsSecureRequest(),
                SameSite = SameSiteMode.Lax,
                Path = "/",
                IsEssential = true
            };

            var refreshDeleteOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = IsSecureRequest(),
                SameSite = SameSiteMode.Lax,
                Path = "/api/auth",
                IsEssential = true
            };

            var csrfDeleteOptions = new CookieOptions
            {
                HttpOnly = false,
                Secure = IsSecureRequest(),
                SameSite = SameSiteMode.Lax,
                Path = "/",
                IsEssential = true
            };

            Response.Cookies.Delete(AuthSecurityConstants.AccessTokenCookieName, accessDeleteOptions);
            Response.Cookies.Delete(AuthSecurityConstants.RefreshTokenCookieName, refreshDeleteOptions);
            Response.Cookies.Delete(AuthSecurityConstants.CsrfCookieName, csrfDeleteOptions);
        }

        private CookieOptions CreateAuthCookieOptions(DateTimeOffset expiresAt, string path)
        {
            return new CookieOptions
            {
                HttpOnly = true,
                Secure = IsSecureRequest(),
                SameSite = SameSiteMode.Lax,
                Path = path,
                Expires = expiresAt,
                IsEssential = true
            };
        }

        private CookieOptions CreateCsrfCookieOptions(DateTimeOffset expiresAt)
        {
            return new CookieOptions
            {
                HttpOnly = false,
                Secure = IsSecureRequest(),
                SameSite = SameSiteMode.Lax,
                Path = "/",
                Expires = expiresAt,
                IsEssential = true
            };
        }

        private AuthResponseDto CreateClientAuthResponse(AuthResponseDto result)
        {
            return new AuthResponseDto
            {
                Success = result.Success,
                Message = result.Message,
                ExpiresIn = result.ExpiresIn,
                User = result.User
            };
        }

        private double GetRefreshTokenExpiryInDays()
        {
            return double.TryParse(_configuration["JwtSettings:RefreshExpiryInDays"], out var days)
                ? days
                : 7;
        }

        private AuthSessionContextDto BuildSessionContext()
        {
            return new AuthSessionContextDto
            {
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers.UserAgent.ToString()
            };
        }

        private bool IsSecureRequest()
        {
            if (Request.IsHttps)
            {
                return true;
            }

            return string.Equals(Request.Headers["X-Forwarded-Proto"], "https", StringComparison.OrdinalIgnoreCase);
        }
    }
}
