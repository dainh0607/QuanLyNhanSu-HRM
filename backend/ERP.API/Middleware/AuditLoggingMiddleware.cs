using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using ERP.Services.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace ERP.API.Middleware
{
    public class AuditLoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public AuditLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IAuditService auditService)
        {
            var method = context.Request.Method;
            
            // Only log mutating actions
            if (method != "POST" && method != "PUT" && method != "DELETE")
            {
                await _next(context);
                return;
            }

            // Exclude auth and audit logs endpoints to avoid loops or sensitive data
            var path = context.Request.Path.Value?.ToLower() ?? "";
            if (path.Contains("/auth/") || path.Contains("/audit-logs"))
            {
                await _next(context);
                return;
            }

            // Capture request details
            var requestUrl = context.Request.Path + context.Request.QueryString;
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var userAgent = context.Request.Headers["User-Agent"].ToString() ?? "unknown";

            // Try to identify target employee from route
            int? targetEmployeeId = null;
            var routeData = context.GetRouteData();
            if (routeData.Values.TryGetValue("employeeId", out var empIdObj) && int.TryParse(empIdObj?.ToString(), out var empId))
            {
                targetEmployeeId = empId;
            }

            // Execute the request
            await _next(context);

            // Post-execution logging
            var statusCode = context.Response.StatusCode;
            
            // Log if success (or specific business failure if needed)
            if (statusCode >= 200 && statusCode < 300)
            {
                string action = method switch
                {
                    "POST" => "CREATE",
                    "PUT" => "UPDATE",
                    "DELETE" => "DELETE",
                    _ => method
                };

                string entityType = path.Split('/', StringSplitOptions.RemoveEmptyEntries).LastOrDefault() ?? "Unknown";
                string content = $"{action} on {entityType} at {path}";

                await auditService.RecordLogAsync(action, entityType, null, content, targetEmployeeId, statusCode, requestUrl);
            }
        }
    }
}
