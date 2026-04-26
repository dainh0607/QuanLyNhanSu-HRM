using System.Threading.Tasks;
using ERP.DTOs.Settings;

namespace ERP.Services.Settings
{
    public interface ITenantSettingService
    {
        Task<TenantSortConfigDto> GetEmployeeSortConfigAsync();
        Task<bool> UpdateEmployeeSortConfigAsync(TenantSortConfigDto dto);
        Task<bool> ResetEmployeeSortConfigAsync();
        Task<ShiftBusinessRulesDto> GetShiftBusinessRulesAsync();
        Task<bool> UpdateShiftBusinessRulesAsync(UpdateShiftBusinessRulesDto dto);
    }
}
