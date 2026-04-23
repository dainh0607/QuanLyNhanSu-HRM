using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities.Models;

namespace ERP.Services.Auth
{
    public interface IUserService
    {
        Task<UserInfoDto?> GetByIdAsync(int id);
        Task<UserInfoDto?> GetByUidAsync(string uid);
        Task<Users?> GetLocalUserByEmailOrUidAsync(string email, string uid);
        Task<int> SyncWithFirebaseAsync();
        Task<Users> CreateLocalUserAsync(int employeeId, string email, string firebaseUid, int? tenantId = null);
        Task AssignRoleAsync(int userId, int roleId, int? tenantId = null, string? assignmentReason = null);
        Task AssignScopedRoleAsync(int userId, int roleId, int? tenantId = null, string? assignmentReason = null, int? branchId = null, int? regionId = null, int? departmentId = null);
    }
}
