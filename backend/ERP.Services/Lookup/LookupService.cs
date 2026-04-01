using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;

namespace ERP.Services.Lookup
{
    public class LookupService : ILookupService
    {
        private readonly IUnitOfWork _unitOfWork;

        public LookupService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<LookupDto>> GetGendersAsync()
        {
            var data = await _unitOfWork.Repository<Genders>().GetAllAsync();
            return data.Select(x => new LookupDto { Code = x.code, Name = x.name });
        }

        public async Task<IEnumerable<LookupDto>> GetMaritalStatusesAsync()
        {
            var data = await _unitOfWork.Repository<MaritalStatuses>().GetAllAsync();
            return data.Select(x => new LookupDto { Code = x.code, Name = x.name });
        }

        public Task<IEnumerable<GeographicalLookupDto>> GetCountriesAsync()
        {
            var data = new List<GeographicalLookupDto>
            {
                new GeographicalLookupDto { Code = "VN", Name = "Việt Nam" },
                new GeographicalLookupDto { Code = "US", Name = "United States" },
                new GeographicalLookupDto { Code = "JP", Name = "Japan" }
            };
            return Task.FromResult<IEnumerable<GeographicalLookupDto>>(data);
        }

        public Task<IEnumerable<GeographicalLookupDto>> GetProvincesAsync(string countryCode)
        {
            if (countryCode != "VN") return Task.FromResult<IEnumerable<GeographicalLookupDto>>(new List<GeographicalLookupDto>());

            var data = new List<GeographicalLookupDto>
            {
                new GeographicalLookupDto { Code = "HN", Name = "Hà Nội", ParentCode = "VN" },
                new GeographicalLookupDto { Code = "HCM", Name = "TP. Hồ Chí Minh", ParentCode = "VN" },
                new GeographicalLookupDto { Code = "DN", Name = "Đà Nẵng", ParentCode = "VN" }
            };
            return Task.FromResult<IEnumerable<GeographicalLookupDto>>(data);
        }

        public Task<IEnumerable<GeographicalLookupDto>> GetDistrictsAsync(string provinceCode)
        {
            var data = new List<GeographicalLookupDto>();
            if (provinceCode == "HN")
            {
                data.Add(new GeographicalLookupDto { Code = "HN_BD", Name = "Ba Đình", ParentCode = "HN" });
                data.Add(new GeographicalLookupDto { Code = "HN_CG", Name = "Cầu Giấy", ParentCode = "HN" });
            }
            else if (provinceCode == "HCM")
            {
                data.Add(new GeographicalLookupDto { Code = "HCM_Q1", Name = "Quận 1", ParentCode = "HCM" });
                data.Add(new GeographicalLookupDto { Code = "HCM_Q3", Name = "Quận 3", ParentCode = "HCM" });
            }
            return Task.FromResult<IEnumerable<GeographicalLookupDto>>(data);
        }
    }
}
