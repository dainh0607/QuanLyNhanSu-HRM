using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Auth
{
    public class PreRegisterStaffDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100)]
        public string FullName { get; set; }
        
        [StringLength(20)]
        public string? EmployeeCode { get; set; }
    }
}
