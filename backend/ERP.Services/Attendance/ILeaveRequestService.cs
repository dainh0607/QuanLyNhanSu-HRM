using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Attendance;
using ERP.Entities.Models;

namespace ERP.Services.Attendance
{
    public interface ILeaveRequestService
    {
        Task<PaginatedListDto<LeaveRequestDto>> GetLeaveRequestsAsync(string? status, int skip, int take);
        Task<LeaveRequestDto?> GetLeaveRequestByIdAsync(int id);
        Task<bool> CreateLeaveRequestAsync(LeaveRequestCreateDto dto);
        
        // Matrix Modal Methods
        Task<LeaveRequestDependentDataDto> GetDependentDataAsync(int branchId, int excludeEmployeeId);
        Task<bool> CreateMatrixLeaveRequestAsync(LeaveRequestCreateMatrixDto dto, int creatorId);
        
        Task<bool> ApproveLeaveRequestAsync(int id, int managerId);
        Task<bool> RejectLeaveRequestAsync(int id, int managerId, string reason);
        Task<IEnumerable<LeaveBalanceDto>> GetLeaveBalanceAsync(int employeeId);
        Task<EmployeeLeaveStatsDto> GetLeaveStatisticsAsync(int employeeId, int year);
    }
}
