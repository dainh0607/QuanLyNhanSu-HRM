using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Attendance
{
    public class LeaveRequestCreateMatrixDto
    {
        [Required(ErrorMessage = "Vui lòng chọn nhân viên.")]
        public int employee_id { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn ngày nghỉ.")]
        public DateTime leave_date { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn ca làm việc.")]
        public int shift_id { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn loại nghỉ phép.")]
        public int leave_type_id { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn thời lượng.")]
        [RegularExpression("^(QUARTER|HALF|THREE_QUARTERS|FULL|HOURLY)$", ErrorMessage = "Thời lượng không hợp lệ.")]
        public string leave_type_duration { get; set; } = string.Empty;

        // Bắt buộc nếu là HOURLY
        public string? start_time { get; set; }
        
        public string? end_time { get; set; }

        public int? handover_employee_id { get; set; }

        [StringLength(20, ErrorMessage = "Số điện thoại bàn giao không được vượt quá 20 ký tự.")]
        public string? handover_phone { get; set; }

        public string? handover_note { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập lý do.")]
        [StringLength(500, ErrorMessage = "Lý do không được vượt quá 500 ký tự.")]
        public string reason { get; set; } = string.Empty;
    }
}
