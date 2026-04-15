using System;
using System.Collections.Generic;

namespace ERP.DTOs.Attendance
{
    public class WeeklyScheduleApiResponseDto
    {
        public string WeekStartDate { get; set; } = string.Empty;
        public List<WeeklyScheduleApiEmployeeDto> Employees { get; set; } = new();
        public List<WeeklyScheduleApiAssignmentDto> Assignments { get; set; } = new();
        public List<WeeklyScheduleApiOpenShiftDto> OpenShifts { get; set; } = new();
        public DateTime? LastUpdatedAt { get; set; }
        public int DraftCount { get; set; }
        public int PublishedCount { get; set; }
        public int ApprovedCount { get; set; }
    }

    public class WeeklyScheduleApiEmployeeDto
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? Avatar { get; set; }
        public string? EmployeeCode { get; set; }
        public int? RegionId { get; set; }
        public string? RegionName { get; set; }
        public int? BranchId { get; set; }
        public string? BranchName { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public int? JobTitleId { get; set; }
        public string? JobTitleName { get; set; }
        public int? AccessGroupId { get; set; }
        public string? AccessGroupName { get; set; }
        public string? GenderCode { get; set; }
        public bool IsActive { get; set; }
    }

    public class WeeklyScheduleApiAssignmentDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public string? EmployeeCode { get; set; }
        public string? EmployeeAvatar { get; set; }
        public int? ShiftId { get; set; }
        public string? ShiftName { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string AssignmentDate { get; set; } = string.Empty;
        public string? AttendanceStatus { get; set; }
        public string? Note { get; set; }
        public string? Status { get; set; }
        public string? Color { get; set; }
        public bool IsPublished { get; set; }
        public int? BranchId { get; set; }
        public string? BranchName { get; set; }
        public int? JobTitleId { get; set; }
        public string? JobTitleName { get; set; }
    }

    public class WeeklyScheduleApiOpenShiftDto
    {
        public int Id { get; set; }
        public int? ShiftId { get; set; }
        public string? ShiftName { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string OpenDate { get; set; } = string.Empty;
        public string? Status { get; set; }
        public string? Color { get; set; }
        public int RequiredQuantity { get; set; }
        public int AssignedQuantity { get; set; }
        public int? BranchId { get; set; }
        public string? BranchName { get; set; }
        public int? DepartmentId { get; set; }
        public int? JobTitleId { get; set; }
        public string? JobTitleName { get; set; }
    }
}
