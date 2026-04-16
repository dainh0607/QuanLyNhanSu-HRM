namespace ERP.DTOs.Attendance
{
    public class ShiftListDto
    {
        public int Id { get; set; }
        public string ShiftCode { get; set; } = string.Empty;
        public string ShiftName { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public decimal DurationHours { get; set; }
        public bool IsOvernight { get; set; }
        public bool IsActive { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
