using System;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace ERP.Services.Helpers
{
    public interface IPasswordHasher
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
    }

    public class PasswordHasher : IPasswordHasher
    {
        private const int SaltSize = 128 / 8; // 128 bits
        private const int KeySize = 256 / 8; // 256 bits
        private const int Iterations = 10000;
        private const KeyDerivationPrf Prf = KeyDerivationPrf.HMACSHA256;

        public string HashPassword(string password)
        {
            // Generate a 128-bit salt using a sequence of cryptographically strong random bytes.
            byte[] salt = new byte[SaltSize];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            // derive a 256-bit subkey (using HMAC-SHA256 with 10,000 iterations)
            string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: Prf,
                iterationCount: Iterations,
                numBytesRequested: KeySize));

            return $"{Convert.ToBase64String(salt)}.{hashed}";
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            try
            {
                var parts = hashedPassword.Split('.', 2);
                if (parts.Length != 2) return false;

                var salt = Convert.FromBase64String(parts[0]);
                var storedHash = parts[1];

                string hashToVerify = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                    password: password,
                    salt: salt,
                    prf: Prf,
                    iterationCount: Iterations,
                    numBytesRequested: KeySize));

                return storedHash == hashToVerify;
            }
            catch
            {
                return false;
            }
        }
    }
}
