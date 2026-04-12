using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Attendance
{
    public class ShiftAssignmentCreateDto
    {
        [Required]
        public int employee_id { get; set; }

        [Required]
        public int shift_id { get; set; }

        [Required]
        public DateTime assignment_date { get; set; }

        public string? note { get; set; }
    }
}
