using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Payroll
{
    public class SalaryGradeConfigDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên bậc lương là bắt buộc")]
        public string Name { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Số tiền không được âm")]
        public decimal Amount { get; set; }

        public string PaymentType { get; set; } = "MONTHLY";
    }

    public class PayrollVariableDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Tên là bắt buộc")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Từ khóa là bắt buộc")]
        public string Keyword { get; set; }

        public int DisplayOrder { get; set; } = 0;

        [Required(ErrorMessage = "Loại biến là bắt buộc")]
        public string Category { get; set; } // allowance, advance, other
    }
}
