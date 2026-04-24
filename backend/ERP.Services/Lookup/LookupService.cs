using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

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

        public async Task<IEnumerable<GeographicalLookupDto>> GetCountriesAsync()
        {
            var data = await _unitOfWork.Repository<Countries>().GetAllAsync();
            return data.Select(x => new GeographicalLookupDto { Code = x.code, Name = x.name });
        }

        public async Task<IEnumerable<GeographicalLookupDto>> GetProvincesAsync(string countryCode)
        {
            var data = await _unitOfWork.Repository<Provinces>().FindAsync(x => x.country_code == countryCode);
            return data.Select(x => new GeographicalLookupDto { Code = x.code, Name = x.name, ParentCode = x.country_code });
        }

        public async Task<IEnumerable<GeographicalLookupDto>> GetDistrictsAsync(string provinceCode)
        {
            var data = await _unitOfWork.Repository<Districts>().FindAsync(x => x.province_code == provinceCode);
            return data.Select(x => new GeographicalLookupDto { Code = x.code, Name = x.name, ParentCode = x.province_code });
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

        public async Task<IEnumerable<LookupDto>> GetMajorsAsync()
        {
            var data = await _unitOfWork.Repository<Majors>().FindAsync(x => x.is_active);
            return data.OrderBy(x => x.name)
                       .Select(x => new LookupDto { Code = x.Id.ToString(), Name = x.name });
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

        public Task<IEnumerable<LookupDto>> GetTaxTypesAsync()
        {
            var data = new List<LookupDto>
            {
                new LookupDto { Code = "LUY_TIEN", Name = "Theo biểu thuế lũy tiến từng phần" },
                new LookupDto { Code = "CO_DINH_10", Name = "Cố định 10% (Vãng lai > 2TR)" },
                new LookupDto { Code = "CO_DINH_20", Name = "Cố định 20% (Không cư trú)" },
                new LookupDto { Code = "MIEN_THUE", Name = "Miễn thuế / Không khấu trừ" }
            };
            return Task.FromResult<IEnumerable<LookupDto>>(data);
        }

        public async Task<IEnumerable<LookupDto>> GetBranchesLookupAsync()
        {
            var data = await _unitOfWork.Repository<Branches>().GetAllAsync();
            return data.Select(x => new LookupDto { Code = x.Id.ToString(), Name = x.name });
        }

        public async Task<IEnumerable<LookupDto>> GetDepartmentsLookupAsync(List<int>? branchIds = null)
        {
            var query = _unitOfWork.Repository<Departments>().AsQueryable();
            
            if (branchIds != null && branchIds.Any())
            {
                query = query.Where(x => !x.branch_id.HasValue || branchIds.Contains(x.branch_id.Value));
            }

            var data = await query.ToListAsync();
            return data.Select(x => new LookupDto { Code = x.Id.ToString(), Name = x.name });
        }

        public async Task<IEnumerable<LookupDto>> GetJobTitlesLookupAsync(List<int>? branchIds = null)
        {
            // JobTitles are now independent of branches per latest requirements
            var query = _unitOfWork.Repository<JobTitles>().AsQueryable();
            var data = await query.ToListAsync();
            return data.Select(x => new LookupDto { Code = x.Id.ToString(), Name = x.name });
        }

        public async Task<IEnumerable<LookupDto>> GetEmploymentTypesLookupAsync()
        {
            var data = await _unitOfWork.Repository<EmploymentTypes>().FindAsync(x => x.is_active);
            return data.OrderBy(x => x.display_order ?? 999).ThenBy(x => x.name)
                       .Select(x => new LookupDto { Code = x.Id.ToString(), Name = x.name });
        }
    }
}
