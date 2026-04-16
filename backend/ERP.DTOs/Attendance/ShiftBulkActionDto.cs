using System.Collections.Generic;

namespace ERP.DTOs.Attendance
{
    public class ShiftBulkActionDto
    {
        public string WeekStartDate { get; set; } = string.Empty;
        public List<int>? AssignmentIds { get; set; }
    }

    public class ShiftBulkActionResultDto
    {
        public int AffectedCount { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ShiftBulkUpdateStatusDto : ShiftBulkActionDto
    {
        public string TargetStatus { get; set; } = string.Empty;
    }
}
