using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Contracts;

namespace ERP.Services.Contracts
{
    public interface IContractService
    {
        Task<IEnumerable<ContractDto>> GetByEmployeeIdAsync(int employeeId);
        Task<ContractDto> GetByIdAsync(int id);
        Task<bool> CreateAsync(ContractCreateDto dto);
        Task<bool> UpdateAsync(int id, ContractUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
