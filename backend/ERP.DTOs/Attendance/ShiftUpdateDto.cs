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

        [Required(ErrorMessage = "Từ khóa là bắt buộc")]
        public string keyword { get; set; } = string.Empty;

        public float standard_effort { get; set; } = 1.0f;

        [Required(ErrorMessage = "Ký hiệu là bắt buộc")]
        public string symbol { get; set; } = string.Empty;

        public string? checkin_window_start { get; set; }
        public string? checkin_window_end { get; set; }
        public string? checkout_window_start { get; set; }
        public string? checkout_window_end { get; set; }

        public int allowed_late_mins { get; set; }
        public int allowed_early_mins { get; set; }
        public int? max_late_mins { get; set; }
        public int? max_early_mins { get; set; }

        public string? checkin_requirement { get; set; }
        public string? checkout_requirement { get; set; }

        public string timezone { get; set; } = "Asia/Saigon";

        public DateTime? start_date { get; set; }
        public DateTime? end_date { get; set; }

        public float min_working_hours { get; set; }

        public int? meal_type_id { get; set; }
        public int meal_count { get; set; }

        public bool is_overtime_shift { get; set; }
    }
}
