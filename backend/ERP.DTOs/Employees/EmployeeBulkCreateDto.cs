using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Employees
{
    public class EmployeeBulkCreateDto
    {
        [Required(ErrorMessage = "Chi nhánh là bắt buộc")]
        public int BranchId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Danh sách nhân viên không được để trống")]
        public List<EmployeeBulkItemDto> Employees { get; set; } = new List<EmployeeBulkItemDto>();
    }

    public class EmployeeBulkItemDto
    {
        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string FullName { get; set; } = string.Empty;

        public string? Phone { get; set; }

        [Required(ErrorMessage = "Nhóm truy cập là bắt buộc")]
        public int AccessGroupId { get; set; }
    }
}
