using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ERP.Services.Auth
{
    public class FirebaseService : IFirebaseService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<FirebaseService> _logger;
        private readonly IWebHostEnvironment _env;

        public FirebaseService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<FirebaseService> logger, IWebHostEnvironment env)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _env = env;
        }

        private bool IsBypassAuth => _env.IsDevelopment() && _configuration.GetValue<bool>("Firebase:BypassAuth");
        private bool IsFirebaseInitialized => FirebaseAdmin.FirebaseApp.DefaultInstance != null;

        public async Task<FirebaseUserDto> CreateUserAsync(UserRecordArgs args)
        {
            if (IsBypassAuth || !IsFirebaseInitialized)
            {
                _logger.LogInformation("Firebase bypass active. Simulating user creation for {Email}", args.Email);
                return new FirebaseUserDto
                {
                    Uid = args.Uid ?? $"bypass-uid-{Guid.NewGuid().ToString("N")[..8]}",
                    Email = args.Email,
                    DisplayName = args.DisplayName,
                    PhoneNumber = args.PhoneNumber,
                    Disabled = args.Disabled
                };
            }

            var userRecord = await FirebaseAuth.DefaultInstance.CreateUserAsync(args);
            return MapToDto(userRecord);
        }

        public async Task<FirebaseUserDto?> GetUserAsync(string uid)
        {
            if (IsBypassAuth || !IsFirebaseInitialized)
            {
                if (uid.StartsWith("bypass-"))
                {
                    return new FirebaseUserDto
                    {
                        Uid = uid,
                        Email = "bypass@nexahrm.com",
                        DisplayName = "Bypass User"
                    };
                }
                return null;
            }

            try
            {
                var userRecord = await FirebaseAuth.DefaultInstance.GetUserAsync(uid);
                return MapToDto(userRecord);
            }
            catch
            {
                return null;
            }
        }

        public async Task<string?> VerifyIdTokenAsync(string idToken)
        {
            if (IsBypassAuth && (string.IsNullOrEmpty(idToken) || idToken == "bypass-token"))
            {
                return "bypass-uid";
            }

            if (!IsFirebaseInitialized)
            {
                return IsBypassAuth ? "bypass-uid" : null;
            }

            try
            {
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                return decodedToken.Uid;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying Firebase token");
                return null;
            }
        }

        public async Task<IEnumerable<FirebaseUserDto>> ListAllUsersAsync()
        {
            var users = new List<FirebaseUserDto>();

            if (IsBypassAuth || !IsFirebaseInitialized)
            {
                _logger.LogInformation("Firebase authentication bypass is active or not initialized. Returning empty list.");
                return users;
            }

            var pagedEnumerable = FirebaseAuth.DefaultInstance.ListUsersAsync(null);
            var enumerator = pagedEnumerable.GetAsyncEnumerator();

            while (await enumerator.MoveNextAsync())
            {
                users.Add(MapToDto(enumerator.Current));
            }

            return users;
        }

        public async Task DeleteUserAsync(string uid)
        {
            if (IsBypassAuth || !IsFirebaseInitialized) return;
            await FirebaseAuth.DefaultInstance.DeleteUserAsync(uid);
        }

        public async Task<(bool Success, string? IdToken, string? RefreshToken, int? ExpiresIn, string? LocalId, string? Email, string? Message)> SignInWithPasswordAsync(string email, string password)
        {
            var normalizedEmail = email?.Trim();

            if (IsBypassAuth)
            {
                _logger.LogInformation("Bypassing Firebase authentication for {Email}", normalizedEmail);
                var fallbackLocalId = string.IsNullOrWhiteSpace(normalizedEmail)
                    ? "bypass-uid"
                    : $"bypass:{normalizedEmail.ToLowerInvariant()}";

                return (true, "bypass-token", "bypass-refresh-token", 3600, fallbackLocalId, normalizedEmail, "Login successful (Bypass Mode)");
            }

            try
            {
                var apiKey = _configuration["Firebase:apiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    throw new AuthenticationSystemException("Firebase:apiKey is missing for login.");
                }

                var client = _httpClientFactory.CreateClient();
                var loginUrl = $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={apiKey}";
                
                var requestBody = new
                {
                    email = normalizedEmail,
                    password = password,
                    returnSecureToken = true
                };

                var response = await client.PostAsJsonAsync(loginUrl, requestBody);
                var content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return HandleFailedLoginResponse(response.StatusCode, content, normalizedEmail);
                }

                var firebaseResponse = JsonSerializer.Deserialize<FirebaseLoginResponse>(content);
                if (firebaseResponse == null ||
                    string.IsNullOrWhiteSpace(firebaseResponse.idToken) ||
                    string.IsNullOrWhiteSpace(firebaseResponse.refreshToken) ||
                    string.IsNullOrWhiteSpace(firebaseResponse.localId))
                {
                    throw new AuthenticationSystemException("Firebase login response is missing required authentication fields.");
                }

                int.TryParse(firebaseResponse?.expiresIn ?? "3600", out int expiresIn);

                return (
                    true,
                    firebaseResponse?.idToken,
                    firebaseResponse?.refreshToken,
                    expiresIn,
                    firebaseResponse?.localId,
                    firebaseResponse?.email ?? normalizedEmail,
                    "Login successful"
                );
            }
            catch (AuthenticationSystemException)
            {
                throw;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Network error during Firebase REST login for {Email}", normalizedEmail);
                throw new AuthenticationSystemException("Khong the ket noi den Firebase de xu ly dang nhap.", ex);
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, "Timeout during Firebase REST login for {Email}", normalizedEmail);
                throw new AuthenticationSystemException("Yeu cau dang nhap toi Firebase bi qua thoi gian cho.", ex);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Invalid Firebase login response for {Email}", normalizedEmail);
                throw new AuthenticationSystemException("Phan hoi dang nhap tu Firebase khong hop le.", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during Firebase REST login for {Email}", normalizedEmail);
                throw new AuthenticationSystemException("Loi he thong xay ra trong qua trinh dang nhap voi Firebase.", ex);
            }
        }

        private (bool Success, string? IdToken, string? RefreshToken, int? ExpiresIn, string? LocalId, string? Email, string? Message) HandleFailedLoginResponse(
            HttpStatusCode statusCode,
            string content,
            string? normalizedEmail)
        {
            var errorCode = TryGetFirebaseErrorCode(content);
            if (TryMapExpectedLoginFailure(errorCode, out var mappedMessage))
            {
                _logger.LogWarning(
                    "Firebase login rejected for {Email}. StatusCode={StatusCode}, FirebaseCode={FirebaseCode}",
                    normalizedEmail,
                    (int)statusCode,
                    errorCode ?? "(unknown)");

                return (false, null, null, null, null, normalizedEmail, mappedMessage);
            }

            if ((int)statusCode >= 500)
            {
                throw new AuthenticationSystemException(
                    $"Firebase login service returned status {(int)statusCode}. FirebaseCode={errorCode ?? "(unknown)"}.");
            }

            throw new AuthenticationSystemException(
                $"Firebase login failed with unexpected response {(int)statusCode}. FirebaseCode={errorCode ?? "(unknown)"}. RawResponse={content}");
        }

        private static bool TryMapExpectedLoginFailure(string? errorCode, out string message)
        {
            message = errorCode switch
            {
                "INVALID_LOGIN_CREDENTIALS" => "Sai email hoac mat khau.",
                "EMAIL_NOT_FOUND" => "Sai email hoac mat khau.",
                "INVALID_PASSWORD" => "Sai email hoac mat khau.",
                "INVALID_EMAIL" => "Email khong hop le.",
                "MISSING_EMAIL" => "Email la bat buoc.",
                "MISSING_PASSWORD" => "Mat khau la bat buoc.",
                "USER_DISABLED" => "Tai khoan da bi vo hieu hoa.",
                "TOO_MANY_ATTEMPTS_TRY_LATER" => "Tai khoan tam thoi bi khoa do dang nhap sai qua nhieu lan.",
                _ => string.Empty
            };

            return !string.IsNullOrWhiteSpace(message);
        }

        private static string? TryGetFirebaseErrorCode(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
            {
                return null;
            }

            try
            {
                using var document = JsonDocument.Parse(content);
                if (!document.RootElement.TryGetProperty("error", out var errorElement))
                {
                    return null;
                }

                if (errorElement.TryGetProperty("message", out var messageElement))
                {
                    return messageElement.GetString();
                }
            }
            catch (JsonException)
            {
                return null;
            }

            return null;
        }

        public async Task UpdateUserPasswordAsync(string uid, string newPassword)
        {
            if (IsBypassAuth || !IsFirebaseInitialized) return;
            var args = new UserRecordArgs
            {
                Uid = uid,
                Password = newPassword
            };
            await FirebaseAuth.DefaultInstance.UpdateUserAsync(args);
        }

        private FirebaseUserDto MapToDto(UserRecord user)
        {
            return new FirebaseUserDto
            {
                Uid = user.Uid,
                Email = user.Email,
                DisplayName = user.DisplayName,
                PhoneNumber = user.PhoneNumber,
                PhotoUrl = user.PhotoUrl,
                Disabled = user.Disabled
            };
        }

        private class FirebaseLoginResponse
        {
            public string idToken { get; set; } = null!;
            public string? email { get; set; }
            public string refreshToken { get; set; } = null!;
            public string expiresIn { get; set; } = null!;
            public string localId { get; set; } = null!;
            public bool registered { get; set; }
        }
    }
}
