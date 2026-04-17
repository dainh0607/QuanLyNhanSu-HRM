using System.Collections.Generic;
using System.Threading.Tasks;

namespace ERP.Services.ControlPlane
{
    public interface ISuperAdminPortalService
    {
        // Placeholders cho tính năng Control Plane sau này
        Task<int> GetTotalTenantsAsync();
        Task<int> GetActiveSubscriptionsAsync();
    }
}
