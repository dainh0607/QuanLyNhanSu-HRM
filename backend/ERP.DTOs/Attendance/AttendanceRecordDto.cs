using System;

namespace ERP.DTOs.Attendance
{
    public class AttendanceRecordDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public DateTime RecordTime { get; set; }
        public string RecordType { get; set; } = null!; // IN, OUT
        public string Source { get; set; } = null!; // Mobile, Web, Biometric
        public string? Note { get; set; }
        public bool Verified { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }

    public class AttendanceCheckInDto
    {
        public string RecordType { get; set; } = "IN";
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Note { get; set; }
        public string? DeviceInfo { get; set; }
    }

    public class AttendanceAdjustmentDto
    {
        public int RecordId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime NewTime { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class AttendanceSummaryDto
    {
        public int EmployeeId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public int TotalDays { get; set; }
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
        public int LateCount { get; set; }
        public int EarlyCount { get; set; }
    }
}
