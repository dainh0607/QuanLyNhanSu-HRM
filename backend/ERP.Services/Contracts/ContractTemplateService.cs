using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Contracts;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Contracts
{
    public class ContractTemplateService : IContractTemplateService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ContractTemplateService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<ContractTemplateListItemDto>> GetAllActiveAsync()
        {
            var templates = await _unitOfWork.Repository<ContractTemplates>()
                .AsQueryable()
                .Where(t => t.is_active)
                .ToListAsync();

            return templates.Select(t => new ContractTemplateListItemDto
            {
                Id = t.Id,
                Name = t.name,
                Category = t.category,
                IsActive = t.is_active
            });
        }

        public async Task<ContractTemplateDto> GetByIdAsync(int id)
        {
            var t = await _unitOfWork.Repository<ContractTemplates>().GetByIdAsync(id);
            if (t == null) return null;

            return new ContractTemplateDto
            {
                Id = t.Id,
                Name = t.name,
                Content = t.content,
                Category = t.category,
                IsActive = t.is_active,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            };
        }
    }
}
