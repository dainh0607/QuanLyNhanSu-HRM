using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Lookup;

namespace ERP.Services.Lookup
{
    public interface IDisciplineTypeService
    {
        Task<PaginatedListDto<DisciplineTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize);
        Task<IEnumerable<DisciplineTypeDto>> GetAllAsync();
        Task<DisciplineTypeDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(DisciplineTypeCreateUpdateDto dto);
        Task<bool> UpdateAsync(int id, DisciplineTypeCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
