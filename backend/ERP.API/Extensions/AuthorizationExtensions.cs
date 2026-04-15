using System;
using System.Security.Claims;
using ERP.Services.Authorization;
using Microsoft.AspNetCore.Http;

namespace ERP.API.Extensions
{
    /// <summary>
    /// FIX #1-15: Extension methods for authorization in controllers
    /// </summary>
    public static class AuthorizationExtensions
    {
        /// <summary>
        /// Get authenticated user's ID from JWT claims
        /// </summary>
        public static int? GetUserId(this ClaimsPrincipal user)
        {
            var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var userId))
                return userId;
            return null;
        }

        /// <summary>
        /// Get user's tenant ID from HttpContext items (set by middleware)
        /// </summary>
        public static int? GetTenantId(this HttpContext context)
        {
            if (context?.Items.TryGetValue("UserScope", out var scopeObj) ?? false)
            {
                var scope = scopeObj as UserScopeInfo;
                return scope?.TenantId;
            }
            return null;
        }

        /// <summary>
        /// Get user's region ID from HttpContext items
        /// </summary>
        public static int? GetRegionId(this HttpContext context)
        {
            if (context?.Items.TryGetValue("UserScope", out var scopeObj) ?? false)
            {
                var scope = scopeObj as UserScopeInfo;
                return scope?.RegionId;
            }
            return null;
        }

        /// <summary>
        /// Get user's branch ID from HttpContext items
        /// </summary>
        public static int? GetBranchId(this HttpContext context)
        {
            if (context?.Items.TryGetValue("UserScope", out var scopeObj) ?? false)
            {
                var scope = scopeObj as UserScopeInfo;
                return scope?.BranchId;
            }
            return null;
        }

        /// <summary>
        /// Get user's department ID from HttpContext items
        /// </summary>
        public static int? GetDepartmentId(this HttpContext context)
        {
            if (context?.Items.TryGetValue("UserScope", out var scopeObj) ?? false)
            {
                var scope = scopeObj as UserScopeInfo;
                return scope?.DepartmentId;
            }
            return null;
        }

        /// <summary>
        /// Get complete scope info from HttpContext
        /// </summary>
        public static UserScopeInfo GetUserScope(this HttpContext context)
        {
            if (context?.Items.TryGetValue("UserScope", out var scopeObj) ?? false)
            {
                return scopeObj as UserScopeInfo;
            }
            return null;
        }

        /// <summary>
        /// Check if request user matches the requested resource owner (PERSONAL scope)
        /// </summary>
        public static bool IsRequestingOwnData(this HttpContext context, int targetUserId)
        {
            var userId = context?.Items["UserId"] as int?;
            return userId.HasValue && userId.Value == targetUserId;
        }
    }
}
