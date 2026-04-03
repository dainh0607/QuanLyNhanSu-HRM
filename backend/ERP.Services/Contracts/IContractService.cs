using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Contracts;

namespace ERP.Services.Contracts
{
    public interface IContractService
    {
        Task<PaginatedListDto<ContractListItemDto>> GetPagedListAsync(ContractFilterDto filter);
        Task<ContractSummaryDto> GetSummaryAsync();
        Task<byte[]> ExportToCsvAsync(ContractFilterDto filter);
        Task<int> DeleteMultipleAsync(int[] ids);
        Task<IEnumerable<ContractDto>> GetByEmployeeIdAsync(int employeeId);
        Task<ContractDto> GetByIdAsync(int id);
        Task<bool> CreateAsync(ContractCreateDto dto);
        Task<bool> UpdateAsync(int id, ContractUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
