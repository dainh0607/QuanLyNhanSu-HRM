using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;

namespace ERP.Services.Attendance
{
    public interface IShiftJobService
    {
        Task<List<ShiftJobDto>> GetAllAsync();
        Task<ShiftJobDto> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateShiftJobDto dto);
        Task<bool> UpdateAsync(int id, UpdateShiftJobDto dto);
        Task<bool> DeleteAsync(int id);
        Task<QuickMatchEmployeesResponseDto> QuickMatchEmployeesAsync(QuickMatchEmployeesRequestDto dto);
    }
}
