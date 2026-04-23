using System.Threading.Tasks;
using ERP.DTOs.Tenant;

namespace ERP.Services.Tenant
{
    public interface ITenantProfileService
    {
        Task<TenantProfileDto> GetProfileAsync();
        Task<bool> UpdateProfileAsync(TenantProfileUpdateDto updateDto);
    }
}
