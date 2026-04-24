using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Lookup;

namespace ERP.Services.Lookup
{
    public interface IMealTypeService
    {
        Task<PaginatedListDto<MealTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize);
        Task<IEnumerable<MealTypeDto>> GetAllAsync();
        Task<MealTypeDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(MealTypeCreateUpdateDto dto);
        Task<bool> UpdateAsync(int id, MealTypeCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
