using System;
using System.Collections.Generic;

namespace ERP.DTOs.Attendance
{
    public class EmployeeLeaveStatsDto
    {
        public List<LeaveTypeStatDto> Details { get; set; } = new();
        public LeaveSummaryDto Summary { get; set; } = new();
    }

    public class LeaveTypeStatDto
    {
        public int LeaveTypeId { get; set; }
        public string LeaveTypeName { get; set; }
        public decimal TotalDays { get; set; }
        public decimal UsedDays { get; set; }
        public decimal RemainingDays { get; set; }
    }

    public class LeaveSummaryDto
    {
        public decimal PaidUsedDays { get; set; }
        public decimal UnpaidUsedDays { get; set; }
    }
}
