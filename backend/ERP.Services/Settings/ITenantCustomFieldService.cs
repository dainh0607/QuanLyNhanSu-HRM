using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Settings;

namespace ERP.Services.Settings
{
    public interface ITenantCustomFieldService
    {
        Task<PaginatedListDto<CustomFieldDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize);
        Task<IEnumerable<CustomFieldDto>> GetAllAsync();
        Task<CustomFieldDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(CustomFieldCreateUpdateDto dto);
        Task<bool> UpdateAsync(int id, CustomFieldCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
