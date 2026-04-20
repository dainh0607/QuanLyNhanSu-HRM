using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Attendance;

namespace ERP.Services.Attendance
{
    public interface IAttendanceService
    {
        Task<bool> CheckInAsync(int userId, AttendanceCheckInDto dto);
        Task<bool> CheckOutAsync(int userId, AttendanceCheckInDto dto);
        Task<IEnumerable<AttendanceRecordDto>> GetTodayAttendanceAsync(int employeeId);
        Task<PaginatedListDto<AttendanceRecordDto>> GetAttendanceHistoryAsync(int employeeId, System.DateTime? fromDate, System.DateTime? toDate, int skip, int take);
        Task<AttendanceSummaryDto> GetAttendanceSummaryAsync(int employeeId, int month, int year);
        Task<IEnumerable<AttendanceRecordDto>> GetMonthlyAttendanceAsync(int employeeId, int month, int year);
        Task<bool> ManualAdjustmentAsync(int modifierId, AttendanceAdjustmentDto dto);
        
        // Machine Mappings
        Task<IEnumerable<EmployeeMachineMappingDto>> GetEmployeeMachineMappingsAsync(int employeeId);
        Task<bool> UpdateEmployeeMachineMappingsAsync(int employeeId, List<EmployeeMachineMappingDto> mappings);
    }
}
