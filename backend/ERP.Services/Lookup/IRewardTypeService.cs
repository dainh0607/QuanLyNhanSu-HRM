using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Lookup;

namespace ERP.Services.Lookup
{
    public interface IRewardTypeService
    {
        Task<PaginatedListDto<RewardTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize);
        Task<IEnumerable<RewardTypeDto>> GetAllAsync();
        Task<RewardTypeDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(RewardTypeCreateUpdateDto dto);
        Task<bool> UpdateAsync(int id, RewardTypeCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
