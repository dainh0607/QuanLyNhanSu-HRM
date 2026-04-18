namespace ERP.DTOs.Attendance
{
    public class ShiftWeekItemDto
    {
        public int WeekNumber { get; set; }
        public int Year { get; set; }
        public string WeekLabel { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public bool IsPast { get; set; }
        public bool IsCurrent { get; set; }
        public bool IsFuture { get; set; }
    }
}
