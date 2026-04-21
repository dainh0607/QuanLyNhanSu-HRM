using System;
using System.Collections.Generic;

namespace ERP.DTOs.Attendance
{
    public class LeaveRequestDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public int LeaveTypeId { get; set; }
        public string? LeaveTypeName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = null!; // PENDING, APPROVED, REJECTED
        public DateTime CreatedAt { get; set; }
    }

    public class LeaveBalanceDto
    {
        public int EmployeeId { get; set; }
        public int LeaveTypeId { get; set; }
        public string? LeaveTypeName { get; set; }
        public decimal TotalDays { get; set; }
        public decimal UsedDays { get; set; }
        public decimal RemainingDays { get; set; }
    }
}
