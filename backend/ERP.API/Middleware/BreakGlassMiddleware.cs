using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using ERP.Services.Auth;
using ERP.Services.Authorization;
using ERP.Entities.Interfaces;

namespace ERP.API.Middleware
{
    public class BreakGlassMiddleware
    {
        private readonly RequestDelegate _next;

        public BreakGlassMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, 
                                     ICurrentUserContext userContext, 
                                     IBreakGlassService breakGlassService,
                                     ILogger<BreakGlassMiddleware> logger)
        {
            if (userContext.IsAuthenticated && userContext.IsBreakGlassSession)
            {
                var userId = userContext.UserId;
                var path = context.Request.Path;
                var method = context.Request.Method;

                logger.LogWarning("Tài khoản khẩn cấp (UserId: {UserId}) đang thực hiện {Method} trên {Path}", 
                                  userId, method, path);

                // Log the action to the database
                // Note: In Phase 2, we just ensure the session is valid. 
                // Detailed audit logging of the body can be added in Phase 3.
            }

            await _next(context);
        }
    }
}
