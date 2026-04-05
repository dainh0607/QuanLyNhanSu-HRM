using System.Threading.Tasks;

namespace ERP.Services.Contracts
{
    public interface IContractNotificationService
    {
        Task<bool> NotifyNextSignerAsync(int contractId);
        Task<bool> NotifySignerAsync(int signerId);
    }
}
