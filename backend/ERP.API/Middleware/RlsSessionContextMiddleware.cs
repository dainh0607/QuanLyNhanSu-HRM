using ERP.Services.Authorization;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace ERP.API.Middleware
{
    /// <summary>
    /// Middleware to inject RLS session context into the database connection
    /// on each authenticated request.
    /// </summary>
    public class RlsSessionContextMiddleware
    {
        private readonly RequestDelegate _next;

        public RlsSessionContextMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IRlsSessionContextService rlsService)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                try
                {
                    // Extract claims from JWT
                    // Note: Claim names must match what is set in AuthService
                    var tenantIdStr = context.User.FindFirst("tenant_id")?.Value;
                    var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    var employeeIdStr = context.User.FindFirst("EmployeeId")?.Value;
                    var scopeLevel = context.User.FindFirst("scope_level")?.Value ?? "PERSONAL";
                    var regionIdStr = context.User.FindFirst("region_id")?.Value;
                    var branchIdStr = context.User.FindFirst("branch_id")?.Value;
                    var departmentIdStr = context.User.FindFirst("department_id")?.Value;
                    var isSystemAdminStr = context.User.FindFirst("is_system_admin")?.Value;

                    if (int.TryParse(tenantIdStr, out int tenantId) && int.TryParse(userIdStr, out int userId))
                    {
                        int? employeeId = int.TryParse(employeeIdStr, out int empId) ? empId : null;
                        int? regionId = int.TryParse(regionIdStr, out int regId) ? regId : null;
                        int? branchId = int.TryParse(branchIdStr, out int brId) ? brId : null;
                        int? departmentId = int.TryParse(departmentIdStr, out int deptId) ? deptId : null;
                        bool isSystemAdmin = isSystemAdminStr?.ToLower() == "true";

                        // Set the context in SQL Server for this connection
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
                }
                catch (Exception)
                {
                    // Fail silently or log (middleware should not crash the request)
                    // If RLS is critical, you might want to return 401/403 here instead
                }
            }

            await _next(context);
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
