using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Lookup;

namespace ERP.Services.Lookup
{
    public interface IOvertimeTypeService
    {
        Task<PaginatedListDto<OvertimeTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize);
        Task<IEnumerable<OvertimeTypeDto>> GetAllAsync();
        Task<OvertimeTypeDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(OvertimeTypeCreateUpdateDto dto);
        Task<bool> UpdateAsync(int id, OvertimeTypeCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
