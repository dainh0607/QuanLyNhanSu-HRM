using System.Threading.Tasks;
using ERP.DTOs.Auth;

namespace ERP.Services.Auth
{
    public interface IAuthService
    {
        Task<AuthResponseDto> SignUpAsync(SignUpDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto, AuthSessionContextDto sessionContext);
        Task<AuthResponseDto> RefreshSessionAsync(string refreshToken, AuthSessionContextDto sessionContext);
        Task RevokeSessionAsync(string refreshToken);
        Task<UserInfoDto?> GetUserByUidAsync(string uid);
        Task<UserInfoDto?> GetUserByIdAsync(int userId);
        Task<string?> VerifyTokenAsync(string idToken);
        Task<int> SyncFirebaseUsersAsync();
        Task<AuthResponseDto> PreRegisterStaffAsync(PreRegisterStaffDto dto);
        string GenerateInternalToken(UserInfoDto user, string sessionId);
        Task<string> CreateFirebaseUserAsync(string email, string password, string displayName, int employeeId);
    }
}
