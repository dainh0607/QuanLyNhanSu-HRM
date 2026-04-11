using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Attendance
{
    public class ShiftTemplateCreateDto
    {
        [Required(ErrorMessage = "Tên mẫu ca là bắt buộc")]
        [StringLength(100)]
        public string TemplateName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Giờ bắt đầu là bắt buộc")]
        [RegularExpression(@"^([01]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Giờ bắt đầu không đúng định dạng HH:mm")]
        public string StartTime { get; set; } = string.Empty;

        [Required(ErrorMessage = "Giờ kết thúc là bắt buộc")]
        [RegularExpression(@"^([01]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Giờ kết thúc không đúng định dạng HH:mm")]
        public string EndTime { get; set; } = string.Empty;

        public bool IsCrossNight { get; set; }

        public List<int> BranchIds { get; set; } = new();
        public List<int> DepartmentIds { get; set; } = new();
        public List<int> PositionIds { get; set; } = new();

        public List<int> RepeatDays { get; set; } = new(); // [1, 2, 3...] 

        public string? Note { get; set; }
    }

    public class ShiftTemplateDto
    {
        public int Id { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public bool IsCrossNight { get; set; }
        public List<int> BranchIds { get; set; } = new();
        public List<int> DepartmentIds { get; set; } = new();
        public List<int> PositionIds { get; set; } = new();
        public List<int> RepeatDays { get; set; } = new();
        public string? Note { get; set; }
    }
}
