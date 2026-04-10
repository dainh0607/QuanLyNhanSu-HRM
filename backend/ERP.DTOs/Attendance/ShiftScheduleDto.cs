using System;
using System.Collections.Generic;

namespace ERP.DTOs.Attendance
{
    public class WeeklyShiftScheduleDto
    {
        public int BranchId { get; set; }
        public string? BranchName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<EmployeeShiftMatrixDto> Employees { get; set; } = new();
    }

    public class EmployeeShiftMatrixDto
    {
        public int EmployeeId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public List<DayShiftDto> Days { get; set; } = new();
    }

    public class DayShiftDto
    {
        public DateTime Date { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        public List<ShiftSummaryDto> Shifts { get; set; } = new();
    }

    public class ShiftSummaryDto
    {
        public int Id { get; set; }
        public string ShiftCode { get; set; } = string.Empty;
        public string ShiftName { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string? Color { get; set; }
    }

    public class ShiftAttendanceDetailDto
    {
        public ShiftSummaryDto? Shift { get; set; }
        public List<AttendanceRecordDto> Attendance { get; set; } = new();
    }

    public class ShiftDetailDto
    {
        public int Id { get; set; }
        public string ShiftCode { get; set; } = string.Empty;
        public string ShiftName { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Color { get; set; }
        public List<int> DefaultBranchIds { get; set; } = new();
        public List<int> DefaultDepartmentIds { get; set; } = new();
        public List<int> DefaultPositionIds { get; set; } = new();
    }
}
