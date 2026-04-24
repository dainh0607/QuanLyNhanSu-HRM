using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;

namespace ERP.Services.Lookup
{
    public interface IAddressService
    {
        Task<IEnumerable<GeographicalLookupDto>> GetProvincesAsync();
        Task<IEnumerable<GeographicalLookupDto>> GetDistrictsAsync(string provinceCode);
        Task<IEnumerable<GeographicalLookupDto>> GetWardsAsync(string districtCode);
        Task SyncAddressDataAsync();

        // Merged Address Methods
        Task<IEnumerable<GeographicalLookupDto>> GetMergedProvincesAsync();
        Task<IEnumerable<GeographicalLookupDto>> GetMergedWardsAsync(string provinceCode);
        Task SyncMergedAddressDataAsync();
    }
}
