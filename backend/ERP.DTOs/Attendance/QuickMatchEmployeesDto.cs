using System.Collections.Generic;

namespace ERP.DTOs.Attendance
{
    public class QuickMatchEmployeesRequestDto
    {
        public List<string> identifiers { get; set; } = new();
    }

    public class QuickMatchEmployeesResponseDto
    {
        public List<MatchedEmployeeDto> matched_employees { get; set; } = new();
        public List<string> unmatched_identifiers { get; set; } = new();
    }

    public class MatchedEmployeeDto
    {
        public int id { get; set; }
        public string employee_code { get; set; } = null!;
        public string full_name { get; set; } = null!;
        public string? email { get; set; }
    }
}
