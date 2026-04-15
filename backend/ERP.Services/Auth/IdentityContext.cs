using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace ERP.Services.Auth
{
    public class CurrentUserContext : ERP.Entities.Interfaces.ICurrentUserContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserContext(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

        public int? UserId => int.TryParse(User?.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

        public int? TenantId => int.TryParse(User?.FindFirst("tenant_id")?.Value, out var id) && id > 0 ? id : null;

        public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

        public bool IsBreakGlassSession => User?.HasClaim("is_break_glass", "true") ?? false;

        public IEnumerable<string> Roles => User?.FindAll(ClaimTypes.Role).Select(c => c.Value) ?? Enumerable.Empty<string>();

        public IEnumerable<int> AllowedRegionIds => ExtractIdsFromClaim("allowed_regions");

        public IEnumerable<int> AllowedBranchIds => ExtractIdsFromClaim("allowed_branches");

        public IEnumerable<int> AllowedDepartmentIds => ExtractIdsFromClaim("allowed_departments");

        public bool IsInRole(string roleName) => User?.IsInRole(roleName) ?? false;

        private IEnumerable<int> ExtractIdsFromClaim(string claimType)
        {
            var claimValue = User?.FindFirst(claimType)?.Value;
            if (string.IsNullOrEmpty(claimValue)) return Enumerable.Empty<int>();
            
            return claimValue.Split(',', StringSplitOptions.RemoveEmptyEntries)
                             .Select(s => int.TryParse(s, out var id) ? id : (int?)null)
                             .Where(id => id.HasValue)
                             .Select(id => id!.Value);
        }
    }
}
