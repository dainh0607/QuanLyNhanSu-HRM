using System;

namespace ERP.DTOs.Employees.Profile
{
    public class BasicInfoDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime? BirthDate { get; set; }
        public string? GenderCode { get; set; }
        public int? DisplayOrder { get; set; }
        public string? MaritalStatusCode { get; set; }
        public int? DepartmentId { get; set; }
        public int? JobTitleId { get; set; }
        public int? BranchId { get; set; }
        public int? ManagerId { get; set; }
        public DateTime? StartDate { get; set; }
        public string? Avatar { get; set; }
    }
}
