namespace ERP.DTOs.Auth
{
    public class AuthResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string IdToken { get; set; }
        public string RefreshToken { get; set; }
        public int ExpiresIn { get; set; }
        public UserInfoDto User { get; set; }
    }

    public class UserInfoDto
    {
        public int UserId { get; set; }
        public int EmployeeId { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string EmployeeCode { get; set; }
        public string PhoneNumber { get; set; }
        public string PhotoUrl { get; set; }
        public bool IsActive { get; set; }
        public List<string> Roles { get; set; }
    }
}
