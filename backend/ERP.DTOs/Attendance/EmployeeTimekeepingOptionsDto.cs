using System;

namespace ERP.DTOs.Attendance
{
    public class EmployeeTimekeepingOptionsDto
    {
        public bool MultiDeviceLogin { get; set; }
        public bool TrackLocation { get; set; }
        public bool NoAttendance { get; set; }
        public bool UnrestrictedAttendance { get; set; }
        public bool AllowLateInOut { get; set; }
        public bool AllowEarlyInOut { get; set; }
        public bool AutoAttendance { get; set; }
        public bool AutoCheckout { get; set; }
        public bool RequireFaceIn { get; set; }
        public bool RequireFaceOut { get; set; }
        public bool ProxyAttendance { get; set; }
        public bool ProxyAttendanceWithImage { get; set; }
        
        // AC 3.2: REQUIRE_GPS, NO_GPS, SHARE_IMAGE
        public string? UnrestrictedLocationOption { get; set; }
    }
}
