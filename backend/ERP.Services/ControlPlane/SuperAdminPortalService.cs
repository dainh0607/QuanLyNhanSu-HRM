using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ERP.Entities;

namespace ERP.Services.ControlPlane
{
    public class SuperAdminPortalService : ISuperAdminPortalService
    {
        private readonly AppDbContext _context;

        public SuperAdminPortalService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<int> GetTotalTenantsAsync()
        {
            // Bỏ qua global filters nếu có để đếm toàn bộ số lượng khánh hàng (Workspace)
            return await _context.Tenants.IgnoreQueryFilters().CountAsync();
        }

        public async Task<int> GetActiveSubscriptionsAsync()
        {
            return await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .CountAsync(s => s.Status == "active");
        }
    }
}
