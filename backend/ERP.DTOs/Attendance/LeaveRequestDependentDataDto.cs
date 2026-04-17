using System.Collections.Generic;

namespace ERP.DTOs.Attendance
{
    public class LeaveRequestDependentDataDto
    {
        public List<LeaveTypeSimpleDto> LeaveTypes { get; set; } = new List<LeaveTypeSimpleDto>();
        public List<EmployeeSimpleDto> HandoverEmployees { get; set; } = new List<EmployeeSimpleDto>();
    }

    public class LeaveTypeSimpleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsPaidLeave { get; set; }
    }

    public class EmployeeSimpleDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? JobTitle { get; set; }
    }
}
