using System;

namespace ERP.DTOs.Employees
{
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? IdentityNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsResigned { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int? JobTitleId { get; set; }
        public string? JobTitleName { get; set; }
        public int? BranchId { get; set; }
        public string? BranchName { get; set; }
        public int? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public string? WorkEmail { get; set; }
        public string? Avatar { get; set; }
    }
}
