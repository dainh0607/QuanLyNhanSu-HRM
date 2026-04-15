using System;
using System.Collections.Generic;
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
                        Email = "bypass@nexahrm.local",
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
                    return (false, null, null, null, null, null, "Firebase API Key is missing");
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
                    _logger.LogWarning($"Firebase login failed for {normalizedEmail}: {content}");
                    return (false, null, null, null, null, normalizedEmail, "Firebase authentication failed");
                }

                var firebaseResponse = JsonSerializer.Deserialize<FirebaseLoginResponse>(content);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during Firebase REST login for {normalizedEmail}");
                return (false, null, null, null, null, normalizedEmail, ex.Message);
            }
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
            public string idToken { get; set; }
            public string email { get; set; }
            public string refreshToken { get; set; }
            public string expiresIn { get; set; }
            public string localId { get; set; }
            public bool registered { get; set; }
        }
    }
}
