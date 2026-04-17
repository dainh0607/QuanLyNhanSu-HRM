using System.Collections.Generic;

namespace ERP.DTOs.Attendance
{
    public class DayAssignedUsersDto
    {
        public string Date { get; set; } = string.Empty;
        public string DayOfWeek { get; set; } = string.Empty;
        public List<ShiftUserDto> Users { get; set; } = new List<ShiftUserDto>();
    }

    public class ShiftUserDto
    {
        public int AssignmentId { get; set; }
        public int EmployeeId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string? Phone { get; set; }
    }
}
