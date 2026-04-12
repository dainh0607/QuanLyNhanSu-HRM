using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Attendance
{
    public class LeaveRequestCreateDto
    {
        [Required]
        public int employee_id { get; set; }

        [Required]
        public DateTime leave_date { get; set; }

        public string leave_type { get; set; } = string.Empty;

        public string duration { get; set; } = string.Empty;

        public string? note { get; set; }
    }
}
