using System.Threading.Tasks;
using ERP.DTOs.Tenant;

namespace ERP.Services.Tenant
{
    public interface ITenantSubscriptionService
    {
        Task<TenantSubscriptionDto> GetMySubscriptionAsync();
        Task<bool> CreateUpgradeRequestAsync(UpgradeRequestDto dto);
    }
}
