using System;
using System.Security.Claims;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Services.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERP.API.Middleware
{
    /// <summary>
    /// Middleware to inject RLS session context into the database connection
    /// on each authenticated request.
    /// </summary>
    public class RlsSessionContextMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RlsSessionContextMiddleware> _logger;

        public RlsSessionContextMiddleware(RequestDelegate next, ILogger<RlsSessionContextMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IRlsSessionContextService rlsService, AppDbContext db)
        {
            if (context.User.Identity?.IsAuthenticated != true)
            {
                await _next(context);
                return;
            }

            try
            {
                var tokenType = context.User.FindFirst(AuthSecurityConstants.TokenTypeClaimType)?.Value;
                if (string.Equals(tokenType, AuthSecurityConstants.SignerTokenType, StringComparison.OrdinalIgnoreCase))
                {
                    await _next(context);
                    return;
                }

                // Extract claims from JWT.
                var tenantIdStr = context.User.FindFirst("tenant_id")?.Value;
                var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var employeeIdStr = context.User.FindFirst("EmployeeId")?.Value;
                var scopeLevel = context.User.FindFirst("scope_level")?.Value ?? "PERSONAL";
                var regionIdStr = context.User.FindFirst("region_id")?.Value;
                var branchIdStr = context.User.FindFirst("branch_id")?.Value;
                var departmentIdStr = context.User.FindFirst("department_id")?.Value;
                var isSystemAdminStr = context.User.FindFirst("is_system_admin")?.Value;

                if (!int.TryParse(tenantIdStr, out var tenantId) || !int.TryParse(userIdStr, out var userId))
                {
                    await _next(context);
                    return;
                }

                if (!await ValidateResolvedWorkspaceAsync(context, db, tenantId, userId))
                {
                    return;
                }

                int? employeeId = int.TryParse(employeeIdStr, out var empId) ? empId : null;
                int? regionId = int.TryParse(regionIdStr, out var regId) ? regId : null;
                int? branchId = int.TryParse(branchIdStr, out var brId) ? brId : null;
                int? departmentId = int.TryParse(departmentIdStr, out var deptId) ? deptId : null;
                var isSystemAdmin = string.Equals(isSystemAdminStr, "true", StringComparison.OrdinalIgnoreCase);

                await rlsService.SetRlsContextAsync(
                    tenantId,
                    userId,
                    employeeId,
                    scopeLevel,
                    regionId,
                    branchId,
                    departmentId,
                    isSystemAdmin,
                    context.Connection.RemoteIpAddress?.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[RLS] Failed to establish tenant session context for {Path}", context.Request.Path);
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Failed to establish workspace security context"
                });
                return;
            }

            await _next(context);
        }

        private async Task<bool> ValidateResolvedWorkspaceAsync(HttpContext context, AppDbContext db, int tenantId, int userId)
        {
            if (!context.Items.TryGetValue(TenantResolutionContext.TenantIdItemKey, out var resolvedTenantObj) ||
                resolvedTenantObj is not int resolvedTenantId)
            {
                return true;
            }

            var resolvedSubdomain = context.Items.TryGetValue(TenantResolutionContext.SubdomainItemKey, out var subdomainObj)
                ? subdomainObj as string
                : null;

            var tenant = await db.Tenants
                .IgnoreQueryFilters()
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            var subdomainMatches = string.IsNullOrWhiteSpace(resolvedSubdomain) ||
                string.Equals(tenant?.subdomain, resolvedSubdomain, StringComparison.OrdinalIgnoreCase);

            if (tenant == null || !tenant.is_active || tenant.Id != resolvedTenantId || !subdomainMatches)
            {
                _logger.LogWarning(
                    "[Tenant] Workspace mismatch. UserId={UserId}, Path={Path}, RequestedTenantId={RequestedTenantId}, RequestedSubdomain={RequestedSubdomain}, TokenTenantId={TokenTenantId}, TokenTenantSubdomain={TokenTenantSubdomain}",
                    userId,
                    context.Request.Path,
                    resolvedTenantId,
                    resolvedSubdomain,
                    tenantId,
                    tenant?.subdomain);

                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Workspace khong khop voi token dang nhap"
                });

                return false;
            }

            return true;
        }
    }

    /// <summary>
    /// Extension method used to add the middleware to the HTTP request pipeline.
    /// </summary>
    public static class RlsSessionContextMiddlewareExtensions
    {
        public static IApplicationBuilder UseRlsSessionContext(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RlsSessionContextMiddleware>();
        }
    }
}
