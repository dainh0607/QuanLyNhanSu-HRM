using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Auth;

namespace ERP.Services.Authorization
{
    public interface IAuthorizationManagementService
    {
        // Role Management
        Task<IEnumerable<RoleSummaryDto>> GetRolesAsync();
        Task<RoleSummaryDto> GetRoleByIdAsync(int id);
        Task<int> CreateRoleAsync(RoleCreateUpdateDto dto);
        Task<bool> UpdateRoleAsync(int id, RoleCreateUpdateDto dto);
        Task<bool> DeleteRoleAsync(int id);

        // Permission Management
        Task<PermissionMappingDto> GetRolePermissionsAsync(int roleId);
        Task<bool> UpdateRolePermissionsAsync(PermissionMappingDto dto);
        Task<PermissionLookupDto> GetPermissionLookupsAsync();

        // User Role Assignment
        Task<bool> AssignRoleToUserAsync(UserRoleAssignmentDto dto);
        Task<bool> RevokeRoleFromUserAsync(int userRoleId);
        Task<IEnumerable<UserRoleAssignmentDto>> GetUserRolesAsync(int userId);
    }
}
