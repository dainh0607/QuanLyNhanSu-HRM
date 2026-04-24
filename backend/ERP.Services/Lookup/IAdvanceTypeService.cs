using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Lookup;

namespace ERP.Services.Lookup
{
    public interface IAdvanceTypeService
    {
        Task<PaginatedListDto<AdvanceTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize);
        Task<IEnumerable<AdvanceTypeDto>> GetAllAsync();
        Task<AdvanceTypeDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(AdvanceTypeCreateUpdateDto dto);
        Task<bool> UpdateAsync(int id, AdvanceTypeCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
