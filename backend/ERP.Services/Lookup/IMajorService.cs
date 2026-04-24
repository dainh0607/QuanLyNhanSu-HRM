using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Lookup;

namespace ERP.Services.Lookup
{
    public interface IMajorService
    {
        Task<PaginatedListDto<MajorDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize);
        Task<IEnumerable<MajorDto>> GetAllAsync();
        Task<MajorDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(MajorCreateUpdateDto dto);
        Task<bool> UpdateAsync(int id, MajorCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
