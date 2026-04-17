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
        Task<AuthResponseDto> PreRegisterStaffAsync(PreRegisterStaffDto dto);
        string GenerateInternalToken(UserInfoDto user, string sessionId);
        Task<string> CreateFirebaseUserAsync(string email, string password, string displayName, int employeeId);
        
        /// <summary>
        /// Chức năng đổi mật khẩu cho người dùng hiện tại (bên trong Thông tin cá nhân)
        /// </summary>
        Task<AuthResponseDto> ChangePasswordAsync(int userId, ChangePasswordDto dto);

        /// <summary>
        /// Tạo link mời tham gia cho ứng viên/nhân viên mới
        /// </summary>
        Task<InvitationResponseDto> GenerateInvitationAsync(InvitationRequestDto dto, int creatorId);

        /// <summary>
        /// Kiểm tra tính hợp lệ của token mời
        /// </summary>
        Task<InvitationValidationDto> ValidateInvitationTokenAsync(string token);

        /// <summary>
        /// Kiểm tra xem hệ thống đã được khởi tạo (bootstrap) chưa
        /// </summary>
        Task<bool> IsSystemBootstrappedAsync();

        /// <summary>
        /// Khởi tạo hệ thống với tài khoản admin đầu tiên
        /// </summary>
        Task<AuthResponseDto> BootstrapSystemAsync();

        /// <summary>
        /// Khởi tạo tài khoản Super Admin (quy trình bảo mật CLI)
        /// </summary>
        Task<AuthResponseDto> InitializeSuperAdminInternalAsync(string email, string password);
    }
}
