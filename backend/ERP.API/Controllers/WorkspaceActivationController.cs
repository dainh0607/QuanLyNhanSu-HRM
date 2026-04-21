using ERP.API.Middleware;
using ERP.DTOs.ControlPlane;
using ERP.DTOs.Auth;
using ERP.Services.Auth;
using ERP.Services.ControlPlane;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/activation")]
    public class WorkspaceActivationController : ControllerBase
    {
        private readonly IWorkspaceActivationService _activationService;
        private readonly IConfiguration _configuration;

        public WorkspaceActivationController(
            IWorkspaceActivationService activationService,
            IConfiguration configuration)
        {
            _activationService = activationService;
            _configuration = configuration;
        }

        /// <summary>
        /// Public endpoint - no authentication required.
        /// Workspace Owner uses activation link to fetch session info.
        /// </summary>
        [HttpGet("workspace-owner")]
        public async Task<IActionResult> FetchActivationSession([FromQuery] string token)
        {
            try
            {
                var result = await _activationService.FetchActivationSessionAsync(token);
                if (!result.Success)
                {
                    return result.Status == "not_found"
                        ? NotFound(result)
                        : BadRequest(result);
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        /// <summary>
        /// Public endpoint - no authentication required.
        /// Workspace Owner sets password and activates account.
        /// </summary>
        [HttpPost("workspace-owner")]
        public async Task<IActionResult> ActivateWorkspaceOwner([FromBody] WorkspaceActivationPayloadDto payload)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _activationService.ActivateWorkspaceOwnerAsync(payload);
                if (!result.Success)
                {
                    return BadRequest(result);
                }

                // IMPORTANT: Write session cookies to override any existing Super Admin session on localhost
                WriteSessionCookies(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
        }

        private void WriteSessionCookies(WorkspaceActivationResultDto result)
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

        private double GetRefreshTokenExpiryInDays()
        {
            return double.TryParse(_configuration["JwtSettings:RefreshExpiryInDays"], out var days)
                ? days
                : 7;
        }

        private bool IsSecureRequest()
        {
            if (Request.IsHttps) return true;
            return string.Equals(Request.Headers["X-Forwarded-Proto"], "https", StringComparison.OrdinalIgnoreCase);
        }
    }
}
