using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Attendance
{
    public class ShiftAssignmentCopyPreviewDto
    {
        [Required]
        public string SourceWeekStartDate { get; set; } = string.Empty;

        public List<int>? BranchIds { get; set; }
        public List<int>? DepartmentIds { get; set; }
    }

    public class ShiftAssignmentCopyPreviewResultDto
    {
        public bool HasData { get; set; }
        public int TotalShifts { get; set; }
        public int TotalEmployees { get; set; }
    }
}
