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

        public Task<IEnumerable<LookupDto>> GetEducationLevelsAsync()
        {
            var data = new List<LookupDto>
            {
                new LookupDto { Code = "CU_NHAN", Name = "Cử nhân" },
                new LookupDto { Code = "KY_SU", Name = "Kỹ sư" },
                new LookupDto { Code = "THAC_SI", Name = "Thạc sĩ" },
                new LookupDto { Code = "TIEN_SI", Name = "Tiến sĩ" },
                new LookupDto { Code = "CAO_DANG", Name = "Cao đẳng" },
                new LookupDto { Code = "TRUNG_CAP", Name = "Trung cấp" },
                new LookupDto { Code = "SAU_DAI_HOC", Name = "Sau đại học" }
            };
            return Task.FromResult<IEnumerable<LookupDto>>(data);
        }

        public Task<IEnumerable<LookupDto>> GetMajorsAsync()
        {
            var data = new List<LookupDto>
            {
                new LookupDto { Code = "IT", Name = "Công nghệ thông tin" },
                new LookupDto { Code = "ECONOMY", Name = "Kinh tế" },
                new LookupDto { Code = "QUAN_TRI_KINH_DOANH", Name = "Quản trị kinh doanh" },
                new LookupDto { Code = "KE_TOAN", Name = "Kế toán" },
                new LookupDto { Code = "NGOAI_NGU", Name = "Ngoại ngữ" },
                new LookupDto { Code = "MARKETING", Name = "Marketing" },
                new LookupDto { Code = "LUAT", Name = "Luật" }
            };
            return Task.FromResult<IEnumerable<LookupDto>>(data);
        }

        public async Task<IEnumerable<LookupDto>> GetContractTypesAsync()
        {
            var data = await _unitOfWork.Repository<ContractTypes>().GetAllAsync();
            return data.Select(x => new LookupDto
            {
                Code = x.Id.ToString(),
                Name = x.name
            });
        }
    }
}
