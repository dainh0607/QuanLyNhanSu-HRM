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
        public const string AccessTokenType = "Access";
        public const string RefreshTokenType = "Refresh";
        public const string SignerTokenType = "Signer";
        public const string SuperAdminPolicyName = "SuperAdminOnly";
        public const string WorkspaceMismatchMessage = "Workspace khong khop voi tai khoan dang nhap.";

        // Access Groups (Roles)
        public const string RoleAdmin = "Admin";
        public const string RoleDirector = "Manager";
        public const string RoleRegionManager = "Regional Manager";
        public const string RoleBranchManager = "Branch Manager";
        public const string RoleDeptManager = "Department Head";
        public const string RoleModuleAdmin = "Module Admin";
        public const string RoleEmployee = "Staff";

        // Access Group IDs
        public const int RoleAdminId = 1;
        public const int RoleDirectorId = 2;
        public const int RoleRegionManagerId = 3;
        public const int RoleBranchManagerId = 4;
        public const int RoleDeptManagerId = 5;
        public const int RoleModuleAdminId = 6;
        public const int RoleEmployeeId = 7;
    }
}
