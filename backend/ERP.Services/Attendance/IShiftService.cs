using System;
using System.Threading.Tasks;
using ERP.DTOs;
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

        // Shift Configuration Management (T212 - T216)
        Task<PaginatedListDto<ShiftListDto>> GetShiftListAsync(string? search, TimeSpan? startTime, TimeSpan? endTime, bool? isActive, int skip, int take);
        Task<bool> UpdateShiftAsync(int id, ShiftUpdateDto dto);
        Task<bool> DeleteOrDeactivateShiftAsync(int id);
        Task<byte[]> ExportShiftListAsync(string? search, TimeSpan? startTime, TimeSpan? endTime, bool? isActive);
    }
}
