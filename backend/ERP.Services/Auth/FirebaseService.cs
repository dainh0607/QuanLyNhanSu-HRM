using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using FirebaseAdmin.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ERP.Services.Auth
{
    public class FirebaseService : IFirebaseService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<FirebaseService> _logger;

        public FirebaseService(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<FirebaseService> logger)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<UserRecord> CreateUserAsync(UserRecordArgs args)
        {
            return await FirebaseAuth.DefaultInstance.CreateUserAsync(args);
        }

        public async Task<string?> VerifyIdTokenAsync(string idToken)
        {
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

        public async Task<IEnumerable<UserRecord>> ListAllUsersAsync()
        {
            var userRecords = new List<UserRecord>();
            var pagedEnumerable = FirebaseAuth.DefaultInstance.ListUsersAsync(null);
            var enumerator = pagedEnumerable.GetAsyncEnumerator();

            while (await enumerator.MoveNextAsync())
            {
                userRecords.Add(enumerator.Current);
            }

            return userRecords;
        }

        public async Task DeleteUserAsync(string uid)
        {
            await FirebaseAuth.DefaultInstance.DeleteUserAsync(uid);
        }

        public async Task<(bool Success, string? IdToken, string? RefreshToken, int? ExpiresIn, string? Message)> SignInWithPasswordAsync(string email, string password)
        {
            try
            {
                var apiKey = _configuration["Firebase:apiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    return (false, null, null, null, "Firebase API Key is missing");
                }

                var client = _httpClientFactory.CreateClient();
                var loginUrl = $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={apiKey}";
                
                var requestBody = new
                {
                    email = email,
                    password = password,
                    returnSecureToken = true
                };

                var response = await client.PostAsJsonAsync(loginUrl, requestBody);
                var content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"Firebase login failed for {email}: {content}");
                    return (false, null, null, null, "Firebase authentication failed");
                }

                var firebaseResponse = JsonSerializer.Deserialize<FirebaseLoginResponse>(content);
                int.TryParse(firebaseResponse?.expiresIn ?? "3600", out int expiresIn);

                return (true, firebaseResponse?.idToken, firebaseResponse?.refreshToken, expiresIn, "Login successful");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during Firebase REST login for {email}");
                return (false, null, null, null, ex.Message);
            }
        }

        public async Task UpdateUserPasswordAsync(string uid, string newPassword)
        {
            var args = new UserRecordArgs
            {
                Uid = uid,
                Password = newPassword
            };
            await FirebaseAuth.DefaultInstance.UpdateUserAsync(args);
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
