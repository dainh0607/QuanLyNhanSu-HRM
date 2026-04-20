using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Authorization;

namespace ERP.Services.Authorization
{
    public interface IMobilePermissionService
    {
        Task<List<MobilePermissionNodeDto>> GetEmployeePermissionsAsync(int employeeId);
        Task<List<MobilePermissionNodeDto>> GetDefaultPermissionsAsync(int employeeId);
        Task<bool> UpdatePermissionsAsync(int employeeId, List<int> allowedPermissionIds);
    }
}
