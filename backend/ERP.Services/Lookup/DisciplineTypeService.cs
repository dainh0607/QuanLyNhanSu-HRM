using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Lookup;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Lookup
{
    public class DisciplineTypeService : IDisciplineTypeService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public DisciplineTypeService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<PaginatedListDto<DisciplineTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize)
        {
            var query = _context.DisciplineTypes.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(x => x.name.Contains(searchTerm) || x.keyword.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.display_order ?? 999)
                .ThenBy(x => x.name)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new DisciplineTypeDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Keyword = x.keyword,
                    Description = x.description,
                    IsActive = x.is_active,
                    DisplayOrder = x.display_order
                })
                .ToListAsync();

            return new PaginatedListDto<DisciplineTypeDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<DisciplineTypeDto>> GetAllAsync()
        {
            return await _context.DisciplineTypes
                .Where(x => x.is_active)
                .OrderBy(x => x.display_order ?? 999)
                .ThenBy(x => x.name)
                .Select(x => new DisciplineTypeDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Keyword = x.keyword,
                    Description = x.description,
                    IsActive = x.is_active,
                    DisplayOrder = x.display_order
                })
                .ToListAsync();
        }

        public async Task<DisciplineTypeDto?> GetByIdAsync(int id)
        {
            var x = await _context.DisciplineTypes.FindAsync(id);
            if (x == null) return null;

            return new DisciplineTypeDto
            {
                Id = x.Id,
                Name = x.name,
                Keyword = x.keyword,
                Description = x.description,
                IsActive = x.is_active,
                DisplayOrder = x.display_order
            };
        }

        public async Task<int> CreateAsync(DisciplineTypeCreateUpdateDto dto)
        {
            var exists = await _context.DisciplineTypes
                .AnyAsync(x => x.keyword.ToLower() == dto.Keyword.ToLower());
            
            if (exists) throw new InvalidOperationException($"Từ khóa kỷ luật '{dto.Keyword}' đã tồn tại.");

            var entity = new DisciplineTypes
            {
                name = dto.Name,
                keyword = dto.Keyword,
                description = dto.Description,
                is_active = dto.IsActive,
                display_order = dto.DisplayOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.DisciplineTypes.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(int id, DisciplineTypeCreateUpdateDto dto)
        {
            var entity = await _context.DisciplineTypes.FindAsync(id);
            if (entity == null) return false;

            var exists = await _context.DisciplineTypes
                .AnyAsync(x => x.Id != id && x.keyword.ToLower() == dto.Keyword.ToLower());
            
            if (exists) throw new InvalidOperationException($"Từ khóa kỷ luật '{dto.Keyword}' đã tồn tại.");

            entity.name = dto.Name;
            entity.keyword = dto.Keyword;
            entity.description = dto.Description;
            entity.is_active = dto.IsActive;
            entity.display_order = dto.DisplayOrder;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.DisciplineTypes.FindAsync(id);
            if (entity == null) return false;

            // AC 3.2: Check usage in Employee Disciplines
            var usageCount = await _context.Set<RequestDisciplines>().CountAsync(r => r.discipline_type_id == id);
            if (usageCount > 0)
            {
                throw new InvalidOperationException($"Không thể xóa hình thức kỷ luật này vì đã phát sinh {usageCount} hồ sơ vi phạm của nhân viên. Bạn chỉ có thể sửa thông tin.");
            }

            // Also check payroll components if keyword is used
            var payrollUsage = await _context.PayrollDetails.AnyAsync(p => p.component_name.Contains(entity.keyword));
            if (payrollUsage)
            {
                throw new InvalidOperationException("Không thể xóa hình thức kỷ luật này vì đã được sử dụng trong công thức tính lương.");
            }

            _context.DisciplineTypes.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
