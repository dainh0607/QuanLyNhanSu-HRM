using ERP.DTOs.Auth;
using FirebaseAdmin.Auth;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERP.Services.Auth
{
    public interface IFirebaseService
    {
        Task<FirebaseUserDto> CreateUserAsync(UserRecordArgs args);
        Task<string?> VerifyIdTokenAsync(string idToken);
        Task<IEnumerable<FirebaseUserDto>> ListAllUsersAsync();
        Task<FirebaseUserDto?> GetUserAsync(string uid);
        Task DeleteUserAsync(string uid);
        Task<(bool Success, string? IdToken, string? RefreshToken, int? ExpiresIn, string? LocalId, string? Email, string? Message)> SignInWithPasswordAsync(string email, string password);
        Task UpdateUserPasswordAsync(string uid, string newPassword);
    }
}
