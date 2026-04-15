using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Attendance
{
    public class ShiftAssignmentCopyDto
    {
        [Required]
        public string SourceWeekStartDate { get; set; } = string.Empty;

        [Required]
        public List<string> TargetWeekStartDates { get; set; } = new();

        public List<int>? BranchIds { get; set; }
        public List<int>? DepartmentIds { get; set; }
        public List<int>? EmployeeIds { get; set; }
        public List<int>? AssignmentIds { get; set; }
        public string MergeMode { get; set; } = "merge";
    }

    public class ShiftAssignmentCopyResultDto
    {
        public int CopiedCount { get; set; }
        public int SkippedCount { get; set; }
    }
}
