using System.Security.Claims;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Services.Auth;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Auth
{
    public class CsrfProtectionMiddleware
    {
        private static readonly HashSet<string> UnsafeMethods = new(StringComparer.OrdinalIgnoreCase)
        {
            HttpMethods.Post,
            HttpMethods.Put,
            HttpMethods.Patch,
            HttpMethods.Delete
        };

        private static readonly string[] ExemptPaths =
        {
            "/api/auth/login",
            "/api/auth/sign-up",
            "/api/auth/verify-token",
            "/api/auth/refresh",
            "/api/auth/logout"
        };

        private readonly RequestDelegate _next;
        private readonly AuthCsrfOptions _options;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<CsrfProtectionMiddleware> _logger;

        public CsrfProtectionMiddleware(RequestDelegate next, AuthCsrfOptions options, IWebHostEnvironment env, ILogger<CsrfProtectionMiddleware> logger)
        {
            _next = next;
            _options = options;
            _env = env;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
        {
            var path = context.Request.Path;
            var method = context.Request.Method;

            if (_env.IsDevelopment() || !RequiresCsrfValidation(context))
            {
                _logger.LogInformation("[CSRF] Skip validation for {Method} {Path} (Development or Safe Method)", method, path);
                await _next(context);
                return;
            }

            _logger.LogInformation("[CSRF] Validating {Method} {Path}", method, path);

            if (!IsAllowedOrigin(context))
            {
                var origin = context.Request.Headers.Origin.ToString();
                _logger.LogWarning("[CSRF] Origin rejected: {Origin}", origin);
                await RejectAsync(context, "Origin khong hop le.");
                return;
            }

            var csrfToken = context.Request.Headers[AuthSecurityConstants.CsrfHeaderName].ToString();
            var bypassHeader = context.Request.Headers["X-Bypass-CSRF"].ToString();

            if (_env.IsDevelopment() && !string.IsNullOrEmpty(bypassHeader))
            {
                _logger.LogInformation("[CSRF] Bypassed by header.");
                await _next(context);
                return;
            }

            if (string.IsNullOrWhiteSpace(csrfToken))
            {
                _logger.LogWarning("[CSRF] Missing CSRF Token Header.");
                await RejectAsync(context, "Thieu CSRF token.");
                return;
            }

            var authSession = await ResolveSessionAsync(context, dbContext);
            if (authSession == null || !authSession.is_active || authSession.revoked_at.HasValue || authSession.expires_at <= DateTime.UtcNow)
            {
                _logger.LogWarning("[CSRF] Session invalid or expired.");
                await RejectAsync(context, "Phien dang nhap khong hop le.");
                return;
            }

            if (!string.Equals(authSession.csrf_token_hash, AuthTokenSecurity.ComputeHash(csrfToken), StringComparison.Ordinal))
            {
                _logger.LogWarning("[CSRF] Token hash mismatch.");
                await RejectAsync(context, "CSRF token khong hop le.");
                return;
            }

            _logger.LogInformation("[CSRF] Validation successful.");
            await _next(context);
        }

        private bool RequiresCsrfValidation(HttpContext context)
        {
            if (!UnsafeMethods.Contains(context.Request.Method))
            {
                return false;
            }

            var path = context.Request.Path.Value ?? string.Empty;
            if (ExemptPaths.Any(exempt => path.StartsWith(exempt, StringComparison.OrdinalIgnoreCase)))
            {
                return false;
            }

            // 1. Bypass if a special header is present (For Development Testing Tools)
            if (_env.IsDevelopment() && context.Request.Headers.ContainsKey("X-Bypass-CSRF"))
            {
                return false;
            }

            // 2. Only require CSRF if cookies are present (CSRF is primarily a Cookie-based attack)
            // If the client is using pure Authorization: Bearer token (no cookies), it's safe to skip CSRF.
            var hasAuthCookie = context.Request.Cookies.ContainsKey(AuthSecurityConstants.AccessTokenCookieName)
                             || context.Request.Cookies.ContainsKey(AuthSecurityConstants.RefreshTokenCookieName);

            return hasAuthCookie;
        }

        private bool IsAllowedOrigin(HttpContext context)
        {
            var origin = context.Request.Headers.Origin.ToString();
            
            // 1. Allow missing Origin in Development for testing tools (REST Client, Postman)
            if (string.IsNullOrWhiteSpace(origin))
            {
                if (_env.IsDevelopment())
                {
                    return true;
                }
                
                // In Production, missing Origin might be a direct request or a tool.
                // We fallback to checking Referer or simply reject if we want strict security.
                // For now, let's treat missing Origin as same-origin check against Host header if Referer is missing too.
                return false; 
            }

            // Normalize for comparison (remove trailing slashes)
            var normalizedOrigin = origin.TrimEnd('/');

            // 2. Allow Same-Origin (Origin matches Host header)
            var hostHeader = context.Request.Host.ToString();
            var scheme = context.Request.Scheme;
            var selfOrigin = $"{scheme}://{hostHeader}".TrimEnd('/');

            if (string.Equals(normalizedOrigin, selfOrigin, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // 3. Allow explicitly configured origins
            return _options.AllowedOrigins.Any(allowed =>
                string.Equals(allowed.TrimEnd('/'), normalizedOrigin, StringComparison.OrdinalIgnoreCase));
        }

        private async Task<AuthSessions?> ResolveSessionAsync(HttpContext context, AppDbContext dbContext)
        {
            var sessionId = context.User.FindFirst(AuthSecurityConstants.SessionIdClaimType)?.Value;
            var userIdValue = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrWhiteSpace(sessionId) && int.TryParse(userIdValue, out var userId))
            {
                return await dbContext.AuthSessions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.session_id == sessionId && s.user_id == userId);
            }

            if (context.Request.Cookies.TryGetValue(AuthSecurityConstants.RefreshTokenCookieName, out var refreshToken) &&
                !string.IsNullOrWhiteSpace(refreshToken))
            {
                var refreshTokenHash = AuthTokenSecurity.ComputeHash(refreshToken);
                return await dbContext.AuthSessions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.refresh_token_hash == refreshTokenHash);
            }

            return null;
        }

        private async Task RejectAsync(HttpContext context, string message)
        {
            var origin = context.Request.Headers.Origin.ToString();
            var path = context.Request.Path;
            var method = context.Request.Method;
            
            _logger.LogWarning("CSRF Rejection: {Message}. Method: {Method}, Path: {Path}, Origin: {Origin}", 
                message, method, path, string.IsNullOrWhiteSpace(origin) ? "(empty)" : origin);

            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new
            {
                Message = message
            });
        }
    }
}
