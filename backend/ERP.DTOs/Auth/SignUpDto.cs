using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Auth
{
    public class SignUpDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Password confirmation is required")]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; }

        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100)]
        public string FullName { get; set; }

        [StringLength(20)]
        public string? EmployeeCode { get; set; }

        public string? CompanyName { get; set; }

        public string? PhoneNumber { get; set; }

        public string? InvitationToken { get; set; }
    }
}
