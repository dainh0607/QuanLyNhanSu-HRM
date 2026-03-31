namespace ERP.DTOs.Auth
{
    public static class AuthSecurityConstants
    {
        public const string AccessTokenCookieName = "hrm_access_token";
        public const string RefreshTokenCookieName = "hrm_refresh_token";
        public const string CsrfCookieName = "hrm_csrf_token";
        public const string CsrfHeaderName = "X-CSRF-Token";
        public const string SessionIdClaimType = "SessionId";
        public const string TokenTypeClaimType = "TokenType";
        public const string AccessTokenType = "access";
        public const string RefreshTokenType = "refresh";
    }
}
