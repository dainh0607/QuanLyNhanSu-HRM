using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Lookup;

namespace ERP.Services.Lookup
{
    public interface IResignationReasonService
    {
        Task<PaginatedListDto<ResignationReasonDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize);
        Task<IEnumerable<ResignationReasonDto>> GetAllAsync();
        Task<ResignationReasonDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(ResignationReasonCreateUpdateDto dto);
        Task<bool> UpdateAsync(int id, ResignationReasonCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
