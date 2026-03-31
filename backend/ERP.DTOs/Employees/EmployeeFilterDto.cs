using System;

namespace ERP.DTOs.Employees
{
    public class EmployeeFilterDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        
        public string? EmployeeCode { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? IdentityNumber { get; set; }
        public string? TaxCode { get; set; }
        
        public string? GenderCode { get; set; }
        public string? MaritalStatusCode { get; set; }
        public int? DepartmentId { get; set; }
        public int? BranchId { get; set; }
        public int? JobTitleId { get; set; }
        public int? ManagerId { get; set; }
        public int? RegionId { get; set; }
        
        public string? Status { get; set; } = "active"; // active, resigned, all
        
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
        
        public bool? IsDepartmentHead { get; set; }
        public string? WorkType { get; set; }
        
        // Sorting
        public string? SortBy { get; set; } // employee_code, full_name, start_date, etc.
        public bool IsDescending { get; set; } = false;
    }
}
