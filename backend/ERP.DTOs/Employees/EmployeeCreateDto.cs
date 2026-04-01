using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Employees
{
    public class EmployeeCreateDto
    {
        [Required(ErrorMessage = "Mã nhân viên là bắt buộc")]
        [StringLength(20, ErrorMessage = "Mã nhân viên không quá 20 ký tự")]
        public string EmployeeCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        [StringLength(100, ErrorMessage = "Họ tên không quá 100 ký tự")]
        public string FullName { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Định dạng email không đúng")]
        public string? Email { get; set; }

        public string? Phone { get; set; }
        
        public DateTime? BirthDate { get; set; }
        public string? GenderCode { get; set; }
        public string? MaritalStatusCode { get; set; }
        
        public int? DepartmentId { get; set; }
        public int? JobTitleId { get; set; }
        public int? BranchId { get; set; }
        public int? ManagerId { get; set; }
        
        public DateTime? StartDate { get; set; }
        public string? IdentityNumber { get; set; }

        [Required(ErrorMessage = "Nhóm truy cập là bắt buộc")]
        public int? AccessGroupId { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(7, ErrorMessage = "Mật khẩu phải dài hơn 6 ký tự")]
        public string Password { get; set; } = string.Empty;

        public string? WorkEmail { get; set; }
        public string? Avatar { get; set; }
    }
}
