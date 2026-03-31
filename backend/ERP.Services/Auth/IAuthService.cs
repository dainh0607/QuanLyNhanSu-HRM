using System.Threading.Tasks;
using ERP.DTOs.Auth;

namespace ERP.Services.Auth
{
    public interface IAuthService
    {
        Task<AuthResponseDto> SignUpAsync(SignUpDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<AuthResponseDto> PreRegisterStaffAsync(PreRegisterStaffDto dto);
        string GenerateInternalToken(UserInfoDto user);
    }
}
