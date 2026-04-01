using FirebaseAdmin.Auth;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERP.Services.Auth
{
    public interface IFirebaseService
    {
        Task<UserRecord> CreateUserAsync(UserRecordArgs args);
        Task<string?> VerifyIdTokenAsync(string idToken);
        Task<IEnumerable<UserRecord>> ListAllUsersAsync();
        Task DeleteUserAsync(string uid);
        Task<(bool Success, string? IdToken, string? RefreshToken, int? ExpiresIn, string? Message)> SignInWithPasswordAsync(string email, string password);
        Task UpdateUserPasswordAsync(string uid, string newPassword);
    }
}
