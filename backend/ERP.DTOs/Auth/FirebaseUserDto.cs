namespace ERP.DTOs.Auth
{
    public class FirebaseUserDto
    {
        public string Uid { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? DisplayName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PhotoUrl { get; set; }
        public bool Disabled { get; set; }
    }
}
