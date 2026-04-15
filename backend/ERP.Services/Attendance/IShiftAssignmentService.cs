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
        Task<ShiftBulkActionResultDto> ApproveAssignmentsAsync(string weekStartDate, List<int>? assignmentIds);
        Task<ShiftBulkActionResultDto> PublishAndApproveAssignmentsAsync(string weekStartDate, List<int>? assignmentIds);
        Task<ShiftBulkActionResultDto> DeleteUnconfirmedAssignmentsAsync(string weekStartDate);
        Task<ShiftCountersDto> GetShiftCountersAsync(string startDateStr, string endDateStr, int? branchId = null);
        Task<ShiftAssignmentCopyResultDto> CopyAssignmentsAsync(ShiftAssignmentCopyDto dto);
    }
}
