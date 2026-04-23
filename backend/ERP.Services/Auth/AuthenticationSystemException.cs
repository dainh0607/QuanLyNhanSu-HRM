using System;

namespace ERP.Services.Auth
{
    public sealed class AuthenticationSystemException : Exception
    {
        public AuthenticationSystemException(string message)
            : base(message)
        {
        }

        public AuthenticationSystemException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}
