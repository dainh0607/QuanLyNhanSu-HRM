using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;

namespace ERP.Services.Lookup
{
    public interface ILookupService
    {
        Task<IEnumerable<LookupDto>> GetGendersAsync();
        Task<IEnumerable<LookupDto>> GetMaritalStatusesAsync();
        
        // Geographical Cascading Lookups (AC 3.3)
        Task<IEnumerable<GeographicalLookupDto>> GetCountriesAsync();
        Task<IEnumerable<GeographicalLookupDto>> GetProvincesAsync(string countryCode);
        Task<IEnumerable<GeographicalLookupDto>> GetDistrictsAsync(string provinceCode);
    }
}
