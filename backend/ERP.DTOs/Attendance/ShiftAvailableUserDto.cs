namespace ERP.DTOs.Attendance
{
    public class ShiftAvailableUserDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string? JobTitle { get; set; }
    }
}
