using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Attendance
{
    public class BulkShiftAssignmentCreateDto
    {
        [Required]
        [MinLength(1, ErrorMessage = "Phải chọn ít nhất 1 nhân viên.")]
        public List<int> employee_ids { get; set; } = new List<int>();

        [Required]
        public int shift_id { get; set; }

        [Required]
        public DateTime assignment_date { get; set; }

        public string? note { get; set; }
    }
}
