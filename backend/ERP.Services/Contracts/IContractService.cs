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
        Task<int> CreateElectronicDraftAsync(ElectronicContractDraftDto dto);
        Task<bool> UpdateAsync(int id, ContractUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<(byte[] content, string contentType, string fileName)> GetContractPreviewAsync(int id);
        Task<List<ContractSignerDto>> SaveElectronicSignersAsync(ContractStep3Dto dto);
        Task<bool> SaveElectronicPositionsAsync(ContractStep4Dto dto);
        Task<ElectronicContractSubmitResultDto> SubmitElectronicContractAsync(int contractId);
    }
}
