using System;

namespace ERP.DTOs.Attendance
{
    public class AttendanceRecordDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public DateTime RecordTime { get; set; }
        public string RecordType { get; set; } // IN, OUT
        public string Source { get; set; } // Mobile, Web, Biometric
        public string Note { get; set; }
        public bool Verified { get; set; }
    }

    public class AttendanceCheckInDto
    {
        public string RecordType { get; set; } = "IN";
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string Note { get; set; }
        public string DeviceInfo { get; set; }
    }
}
