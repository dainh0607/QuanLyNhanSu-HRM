using System.Threading.Tasks;
using ERP.DTOs.Tenant;

namespace ERP.Services.Tenant
{
    public interface ITenantProfileService
    {
        Task<TenantProfileDto> GetProfileAsync();
        Task<bool> UpdateProfileAsync(TenantProfileUpdateDto updateDto);
        Task<string> UploadLogoAsync(System.IO.Stream fileStream, string fileName, string contentType);
        Task<BrandingDto?> GetBrandingBySubdomainAsync(string subdomain);
    }
}
