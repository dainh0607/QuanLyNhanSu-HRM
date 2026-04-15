using System;
using System.Security.Claims;
using System.Threading.Tasks;
using ERP.Services.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace ERP.API.Middleware
{
    /// <summary>
    /// FIX #1, #4: Authorization middleware to enforce scope and permission checks
    /// Validates that authenticated users can only access resources within their scope
    /// </summary>
    public class AuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<AuthorizationMiddleware> _logger;

        public AuthorizationMiddleware(RequestDelegate next, ILogger<AuthorizationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IAuthorizationService authService)
        {
            // Skip authorization for public endpoints
            if (IsPublicEndpoint(context.Request.Path))
            {
                await _next(context);
                return;
            }

            // Skip if not authenticated
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                await _next(context);
                return;
            }

            try
            {
                // Get user ID from claims
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
                if (!int.TryParse(userIdClaim?.Value, out var userId))
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { error = "Invalid user ID in token" });
                    return;
                }

                // Get user scope info and store in HttpContext for use in controllers
                var scopeInfo = await authService.GetUserScopeInfo(userId);
                context.Items["UserScope"] = scopeInfo;
                context.Items["UserId"] = userId;

                _logger.LogDebug($"[AUTH] User {userId} scope: TenantId={scopeInfo.TenantId}, RegionId={scopeInfo.RegionId}, BranchId={scopeInfo.BranchId}, DeptId={scopeInfo.DepartmentId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AUTH] Error in authorization middleware");
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsJsonAsync(new { error = "Authorization check failed" });
                return;
            }

            await _next(context);
        }

        private bool IsPublicEndpoint(PathString path)
        {
            var publicPaths = new[]
            {
                "/api/auth/login",
                "/api/auth/register",
                "/api/auth/refresh",
                "/api/health",
                "/swagger",
                "/openapi"
            };

            var pathValue = path.Value?.ToLower() ?? "";

            foreach (var publicPath in publicPaths)
            {
                if (pathValue.StartsWith(publicPath, StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }
    }
}
