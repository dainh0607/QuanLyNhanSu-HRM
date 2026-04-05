using System.Threading.Tasks;
using ERP.Entities.Models;

namespace ERP.Services.Common
{
    public interface IPdfService
    {
        Task<byte[]> GenerateContractPdfAsync(Entities.Models.Contracts contract);
    }
}
