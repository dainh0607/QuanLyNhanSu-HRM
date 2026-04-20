using System;

namespace ERP.DTOs.Employees
{
    public class EmploymentHistoryFilterDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public int? EmployeeId { get; set; }
        public string? ChangeType { get; set; } // Tất cả, Chi nhánh, Phòng ban, Chức danh, Tiền lương, Phụ cấp, Thu nhập khác
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int? BranchId { get; set; }
        public int? DepartmentId { get; set; }
        
        // IDs for bulk deletion
        public int[]? SelectedIds { get; set; }
    }
}
