using System;

namespace ERP.DTOs.Attendance
{
    public class EmployeeDeviceDto
    {
        public int Id { get; set; }
        public string DeviceId { get; set; } = null!; // IMEI
        public string DeviceName { get; set; } = null!;
        public string? OS { get; set; }
        public string? DeviceType { get; set; }
        public DateTime LinkedAt { get; set; } // CreatedAt
    }
}
