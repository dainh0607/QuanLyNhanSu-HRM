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

        // Education Lookups (AC 4.1)
        Task<IEnumerable<LookupDto>> GetEducationLevelsAsync();
        Task<IEnumerable<LookupDto>> GetMajorsAsync();

        // Contract Lookups (SCRUM-218 & SCRUM-132)
        Task<IEnumerable<LookupDto>> GetContractTypesAsync();
        Task<IEnumerable<LookupDto>> GetTaxTypesAsync();

        // Organization dropdowns (T178)
        Task<IEnumerable<LookupDto>> GetBranchesLookupAsync();
        Task<IEnumerable<LookupDto>> GetDepartmentsLookupAsync(List<int>? branchIds = null);
        Task<IEnumerable<LookupDto>> GetJobTitlesLookupAsync(List<int>? branchIds = null);
        Task<IEnumerable<LookupDto>> GetEmploymentTypesLookupAsync();
    }
}
