using System.Security.Cryptography;
using System.Text;

namespace ERP.Services.Auth
{
    public static class AuthTokenSecurity
    {
        public static string GenerateOpaqueToken(int sizeInBytes = 64)
        {
            var bytes = RandomNumberGenerator.GetBytes(sizeInBytes);
            return Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        public static string ComputeHash(string value)
        {
            var bytes = Encoding.UTF8.GetBytes(value);
            var hash = SHA256.HashData(bytes);
            return Convert.ToHexString(hash);
        }
    }
}
