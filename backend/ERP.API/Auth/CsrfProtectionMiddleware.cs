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
            "/api/auth/verify-token"
        };

        private readonly RequestDelegate _next;
        private readonly AuthCsrfOptions _options;

        public CsrfProtectionMiddleware(RequestDelegate next, AuthCsrfOptions options)
        {
            _next = next;
            _options = options;
        }

        public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
        {
            if (!RequiresCsrfValidation(context))
            {
                await _next(context);
                return;
            }

            if (!IsAllowedOrigin(context))
            {
                await RejectAsync(context, "Origin khong hop le.");
                return;
            }

            var csrfToken = context.Request.Headers[AuthSecurityConstants.CsrfHeaderName].ToString();
            if (string.IsNullOrWhiteSpace(csrfToken))
            {
                await RejectAsync(context, "Thieu CSRF token.");
                return;
            }

            var authSession = await ResolveSessionAsync(context, dbContext);
            if (authSession == null || !authSession.is_active || authSession.revoked_at.HasValue || authSession.expires_at <= DateTime.UtcNow)
            {
                await RejectAsync(context, "Phien dang nhap khong hop le.");
                return;
            }

            if (!string.Equals(authSession.csrf_token_hash, AuthTokenSecurity.ComputeHash(csrfToken), StringComparison.Ordinal))
            {
                await RejectAsync(context, "CSRF token khong hop le.");
                return;
            }

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

            return context.Request.Cookies.ContainsKey(AuthSecurityConstants.AccessTokenCookieName)
                || context.Request.Cookies.ContainsKey(AuthSecurityConstants.RefreshTokenCookieName);
        }

        private bool IsAllowedOrigin(HttpContext context)
        {
            var origin = context.Request.Headers.Origin.ToString();
            if (string.IsNullOrWhiteSpace(origin))
            {
                return false;
            }

            return _options.AllowedOrigins.Any(allowed =>
                string.Equals(allowed, origin, StringComparison.OrdinalIgnoreCase));
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

        private static async Task RejectAsync(HttpContext context, string message)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new
            {
                Message = message
            });
        }
    }
}
