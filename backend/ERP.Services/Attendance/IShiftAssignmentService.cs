using System.Threading.Tasks;
using ERP.DTOs.Attendance;

namespace ERP.Services.Attendance
{
    public interface IShiftAssignmentService
    {
        Task<WeeklyScheduleApiResponseDto> GetWeeklyScheduleAsync(string weekStartDate, int? branchId, int? departmentId, string? searchTerm);
        Task<int> CreateAssignmentAsync(ShiftAssignmentCreateDto dto);
        Task<bool> DeleteAssignmentByIdAsync(int id);
        Task<bool> RefreshAttendanceAsync(int assignmentId);
    }
}
