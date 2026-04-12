using System;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;

namespace ERP.Services.Attendance
{
    public interface IShiftService
    {
        Task<WeeklyShiftScheduleDto> GetWeeklyScheduleAsync(int branchId, DateTime startDate);
        Task<ShiftAttendanceDetailDto> GetShiftAttendanceDetailAsync(int employeeId, DateTime date);
        Task<bool> DeleteShiftAssignmentAsync(int employeeId, DateTime date);
        Task<int> CreateShiftAsync(ShiftCreateDto dto);

        // Shift detail & Open shifts (T177/T182)
        Task<ShiftDetailDto?> GetShiftDetailAsync(int shiftId);
        Task<bool> CreateOpenShiftsAsync(OpenShiftCreateDto dto);
        Task<IEnumerable<WeeklyScheduleApiOpenShiftDto>> GetOpenShiftsAsync(DateTime startDate, DateTime endDate, int? branchId);
        Task<IEnumerable<ShiftOptionApiItemDto>> GetShiftsAsync(bool? isActive, int? branchId);
    }
}
