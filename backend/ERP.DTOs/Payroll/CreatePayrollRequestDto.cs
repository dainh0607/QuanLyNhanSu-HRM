using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Payroll
{
    public class CreatePayrollRequestDto
    {
        [Required(ErrorMessage = "Tên bảng lương là bắt buộc")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Từ khóa bảng lương là bắt buộc")]
        public string Code { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn loại bảng lương")]
        public int PayrollTypeId { get; set; }

        public string TimeType { get; set; } // FULL_MONTH, RANGE

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public bool IsHidden { get; set; }
    }

    public class PayrollTypeDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên bảng lương là bắt buộc")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Từ khóa là bắt buộc")]
        public string Code { get; set; }

        public string PaymentType { get; set; }
        public string ApplicableBranches { get; set; }
        public string ApplicableDepartments { get; set; }
        public string ApplicableJobTitles { get; set; }
        public string ApplicableEmployees { get; set; }
        public string ViewerPermissions { get; set; }
        public string Description { get; set; }
    }
}
