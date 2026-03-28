using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Employees
{
    public class EmployeeUpdateDto
    {
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
        public string? WorkEmail { get; set; }
        public string? Avatar { get; set; }
        public bool IsActive { get; set; }
        public bool IsResigned { get; set; }
    }
}
