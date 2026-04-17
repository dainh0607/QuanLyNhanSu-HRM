namespace ERP.DTOs.Attendance
{
    public class ShiftTabDto
    {
        public int ShiftId { get; set; }
        public string ShiftName { get; set; } = string.Empty;
        public string ShiftCode { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
    }
}
