using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;

namespace ERP.Services.Attendance
{
    public interface IShiftAssignmentService
    {
        Task<WeeklyScheduleApiResponseDto> GetWeeklyScheduleAsync(
            string weekStartDate, 
            int? branchId = null, 
            int? departmentId = null, 
            string? searchTerm = null,
            int? regionId = null,
            int? jobTitleId = null,
            int? accessGroupId = null,
            string? genderCode = null,
            string? employeeStatus = "active");
        Task<int> CreateAssignmentAsync(ShiftAssignmentCreateDto dto);
        Task<bool> DeleteAssignmentByIdAsync(int id);
        Task<bool> RefreshAttendanceAsync(int assignmentId);
        Task<ShiftBulkActionResultDto> PublishAssignmentsAsync(string weekStartDate, List<int>? assignmentIds);
        
        [System.Obsolete("Approve step is no longer used.")]
        Task<ShiftBulkActionResultDto> ApproveAssignmentsAsync(string weekStartDate, List<int>? assignmentIds);
        
        [System.Obsolete("Approve step is no longer used.")]
        Task<ShiftBulkActionResultDto> PublishAndApproveAssignmentsAsync(string weekStartDate, List<int>? assignmentIds);
        
        Task<ShiftBulkActionResultDto> DeleteUnconfirmedAssignmentsAsync(string weekStartDate);
        Task<ShiftCountersDto> GetShiftCountersAsync(string startDateStr, string endDateStr, int? branchId = null);
        Task<ShiftAssignmentCopyResultDto> CopyAssignmentsAsync(ShiftAssignmentCopyDto dto, int currentUserId);
        Task<ShiftBulkActionResultDto> UpdateShiftStatusAsync(ShiftBulkUpdateStatusDto dto);

        // Copy Assignments Expansion (T233, T234)
        Task<IEnumerable<ShiftWeekItemDto>> GetWeeksListAsync(int? year);
        Task<ShiftAssignmentCopyPreviewResultDto> PreviewCopyAssignmentsAsync(ShiftAssignmentCopyPreviewDto dto);


        // Manage Assignments via Shift Tabs Modal (T223 - T225)
        Task<IEnumerable<ShiftTabDto>> GetShiftTabsAsync(int branchId);
        Task<IEnumerable<DayAssignedUsersDto>> GetAssignedUsersByShiftAndWeekAsync(int shiftId, DateTime weekStartDate, int branchId);
        Task<IEnumerable<ShiftAvailableUserDto>> GetAvailableUsersAsync(int branchId, int shiftId, DateTime date);
        Task<bool> BulkCreateAssignmentsAsync(BulkShiftAssignmentCreateDto dto);
    }
}
