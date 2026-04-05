using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Contracts;

namespace ERP.Services.Contracts
{
    public interface IContractTemplateService
    {
        Task<IEnumerable<ContractTemplateListItemDto>> GetAllActiveAsync();
        Task<ContractTemplateDto> GetByIdAsync(int id);
    }
}
