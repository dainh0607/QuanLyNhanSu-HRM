using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Attendance
{
    public class ShiftCreateDto
    {
        [Required(ErrorMessage = "Mã ca là bắt buộc")]
        [StringLength(20)]
        public string ShiftCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên ca là bắt buộc")]
        [StringLength(100)]
        public string ShiftName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Giờ bắt đầu là bắt buộc")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "Giờ kết thúc là bắt buộc")]
        public TimeSpan EndTime { get; set; }

        public TimeSpan? BreakStart { get; set; }
        public TimeSpan? BreakEnd { get; set; }

        public int GracePeriodIn { get; set; } = 0;
        public int GracePeriodOut { get; set; } = 0;
        public int MinCheckinBefore { get; set; } = 0;
        public bool IsOvernight { get; set; } = false;

        [StringLength(20)]
        public string? Color { get; set; }

        public int ShiftTypeId { get; set; } = 1; // Default to Fixed if not specified
        public string? Note { get; set; }
        
        [Required(ErrorMessage = "Từ khóa là bắt buộc")]
        [StringLength(50)]
        public string Keyword { get; set; } = string.Empty;

        public float StandardEffort { get; set; } = 1.0f;

        [Required(ErrorMessage = "Ký hiệu là bắt buộc")]
        [StringLength(10)]
        public string Symbol { get; set; } = string.Empty;

        public TimeSpan? CheckinWindowStart { get; set; }
        public TimeSpan? CheckinWindowEnd { get; set; }
        public TimeSpan? CheckoutWindowStart { get; set; }
        public TimeSpan? CheckoutWindowEnd { get; set; }

        public int AllowedLateMins { get; set; } = 0;
        public int AllowedEarlyMins { get; set; } = 0;
        public int? MaxLateMins { get; set; }
        public int? MaxEarlyMins { get; set; }

        public string? CheckinRequirement { get; set; }
        public string? CheckoutRequirement { get; set; }

        public string Timezone { get; set; } = "Asia/Saigon";

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public float MinWorkingHours { get; set; } = 0f;

        public int? MealTypeId { get; set; }
        public int MealCount { get; set; } = 0;

        public bool IsOvertimeShift { get; set; } = false;

        // Optional assignment parameters (T201)
        public int? AssignToUserId { get; set; }
        public DateTime? AssignDate { get; set; }

        // Bulk assignment filters (T300)
        public int[]? BranchIds { get; set; }
        public int[]? DepartmentIds { get; set; }
        public int[]? JobTitleIds { get; set; }
        public string[]? RepeatDays { get; set; }
        public bool IsPublished { get; set; } = false;
    }
}
