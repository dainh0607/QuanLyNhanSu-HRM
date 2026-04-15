using System;
using System.Collections.Generic;

namespace ERP.Entities.Interfaces
{
    public interface ICurrentUserContext
    {
        int? UserId { get; }
        int? TenantId { get; }
        bool IsAuthenticated { get; }
        bool IsBreakGlassSession { get; }
        IEnumerable<string> Roles { get; }
        
        IEnumerable<int> AllowedRegionIds { get; }
        IEnumerable<int> AllowedBranchIds { get; }
        IEnumerable<int> AllowedDepartmentIds { get; }
        
        bool IsInRole(string roleName);
    }
}
