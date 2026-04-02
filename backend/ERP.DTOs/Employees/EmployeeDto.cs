using System;

namespace ERP.DTOs.Employees
{
    public class EmployeeDto
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
        public string? GenderCode { get; set; }
        public int? DisplayOrder { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? HomePhone { get; set; }
        public string? IdentityNumber { get; set; }
        public DateTime? IdentityIssueDate { get; set; }
        public string? IdentityIssuePlace { get; set; }
        public string? Passport { get; set; }
        public string? Nationality { get; set; }
        public string? OriginPlace { get; set; }
        public string? Ethnicity { get; set; }
        public string? Religion { get; set; }
        public string? TaxCode { get; set; }
        public string? MaritalStatusCode { get; set; }
        public DateTime? StartDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsResigned { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int? JobTitleId { get; set; }
        public string? JobTitleName { get; set; }
        public string? RegionName { get; set; }
        public string? AccessGroup { get; set; }
        public int? BranchId { get; set; }
        public string? BranchName { get; set; }
        public int? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public string? WorkEmail { get; set; }
        public string? Skype { get; set; }
        public string? Facebook { get; set; }
        public string? UnionGroup { get; set; }
        public string? Note { get; set; }
        public string? Avatar { get; set; }
    }
}
