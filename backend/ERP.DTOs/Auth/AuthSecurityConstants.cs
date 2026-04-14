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

        // Access Groups (Roles)
        public const string RoleAdmin = "Quản trị";
        public const string RoleDirector = "Ban giám đốc";
        public const string RoleRegionManager = "Quản lý vùng";
        public const string RoleBranchManager = "Quản lý chi nhánh";
        public const string RoleDeptManager = "Quản lý bộ phận";
        public const string RoleModuleAdmin = "Quản trị phân hệ";
        public const string RoleEmployee = "Nhân viên";

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
