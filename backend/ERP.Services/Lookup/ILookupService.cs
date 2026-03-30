using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;

namespace ERP.Services.Lookup
{
    public interface ILookupService
    {
        Task<IEnumerable<LookupDto>> GetGendersAsync();
        Task<IEnumerable<LookupDto>> GetMaritalStatusesAsync();
    }
}
