using System;
using System.Collections.Generic;

namespace ERP.DTOs.Attendance
{
    public class ShiftOptionApiItemDto
    {
        public int id { get; set; }
        public int shift_id { get; set; }
        public string shift_name { get; set; } = string.Empty;
        public string start_time { get; set; } = string.Empty;
        public string end_time { get; set; } = string.Empty;
        public int? branch_id { get; set; }
        public string? branch_name { get; set; }
        public string? color { get; set; }
        public string? note { get; set; }
        public List<int> branch_ids { get; set; } = new();
        public List<int> department_ids { get; set; } = new();
        public List<int> job_title_ids { get; set; } = new();
    }
}
