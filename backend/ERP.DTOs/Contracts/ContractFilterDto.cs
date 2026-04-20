using System;

namespace ERP.DTOs.Contracts
{
    public class ContractFilterDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Search { get; set; }
        public string? Status { get; set; }
        public int? ContractTypeId { get; set; }
        public int? BranchId { get; set; }
        public int? DepartmentId { get; set; }
        public int? EmployeeId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
