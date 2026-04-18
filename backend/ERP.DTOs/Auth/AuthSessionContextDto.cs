namespace ERP.DTOs.Auth
{
    public class AuthSessionContextDto
    {
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public int? ResolvedTenantId { get; set; }
        public string? ResolvedTenantSubdomain { get; set; }
    }
}
