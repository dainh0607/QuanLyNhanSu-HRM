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
    }
}
