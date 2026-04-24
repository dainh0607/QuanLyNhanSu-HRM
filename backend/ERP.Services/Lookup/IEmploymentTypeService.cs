using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Common;
using ERP.DTOs.Lookup;

namespace ERP.Services.Lookup
{
    public interface IEmploymentTypeService
    {
        Task<PaginatedListDto<EmploymentTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize);
        Task<IEnumerable<EmploymentTypeDto>> GetAllAsync();
        Task<EmploymentTypeDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(EmploymentTypeCreateUpdateDto dto);
        Task<bool> UpdateAsync(int id, EmploymentTypeCreateUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
