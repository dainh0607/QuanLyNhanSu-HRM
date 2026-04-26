using System.Collections.Generic;

namespace ERP.DTOs.Attendance
{
    public class ShiftJobDto
    {
        public int id { get; set; }
        public string name { get; set; } = null!;
        public string code { get; set; } = null!;
        public int branch_id { get; set; }
        public string? branch_name { get; set; }
        public string? color_code { get; set; }
        public bool is_active { get; set; }
        public string? description { get; set; }
        public List<int> department_ids { get; set; } = new();
        public List<int> employee_ids { get; set; } = new();
        public string? assignment_summary { get; set; }
    }

    public class CreateShiftJobDto
    {
        public string name { get; set; } = null!;
        public string code { get; set; } = null!;
        public int branch_id { get; set; }
        public string? color_code { get; set; }
        public bool is_active { get; set; } = true;
        public string? description { get; set; }
        public List<int> department_ids { get; set; } = new();
        public List<int> employee_ids { get; set; } = new();
    }

    public class UpdateShiftJobDto
    {
        public string name { get; set; } = null!;
        public string code { get; set; } = null!;
        public int branch_id { get; set; }
        public string? color_code { get; set; }
        public bool is_active { get; set; }
        public string? description { get; set; }
        public List<int> department_ids { get; set; } = new();
        public List<int> employee_ids { get; set; } = new();
    }
}
