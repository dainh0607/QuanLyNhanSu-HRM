using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Attendance
{
    public class ShiftUpdateDto
    {
        [Required(ErrorMessage = "Tên ca là bắt buộc")]
        public string shift_name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mã ca là bắt buộc")]
        public string shift_code { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Thời gian bắt đầu không hợp lệ (HH:mm)")]
        public string start_time { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Thời gian kết thúc không hợp lệ (HH:mm)")]
        public string end_time { get; set; } = string.Empty;

        public string? break_start { get; set; }
        public string? break_end { get; set; }

        public int grace_period_in { get; set; }
        public int grace_period_out { get; set; }
        public int min_checkin_before { get; set; }

        public bool is_overnight { get; set; }
        public string color { get; set; } = "#1890ff";
        
        public int shift_type_id { get; set; }
        public bool is_active { get; set; } = true;
        
        public string? note { get; set; }
    }
}
