using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Common;
using ERP.DTOs.Lookup;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Lookup
{
    public class EmploymentTypeService : IEmploymentTypeService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public EmploymentTypeService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<PaginatedListDto<EmploymentTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize)
        {
            var query = _context.Set<EmploymentTypes>().AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(x => x.name.Contains(searchTerm) || (x.description != null && x.description.Contains(searchTerm)));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.display_order ?? 999)
                .ThenBy(x => x.name)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new EmploymentTypeDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Description = x.description,
                    DisplayOrder = x.display_order,
                    IsActive = x.is_active
                })
                .ToListAsync();

            return new PaginatedListDto<EmploymentTypeDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<EmploymentTypeDto>> GetAllAsync()
        {
            return await _context.Set<EmploymentTypes>()
                .Where(x => x.is_active)
                .OrderBy(x => x.display_order ?? 999)
                .ThenBy(x => x.name)
                .Select(x => new EmploymentTypeDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Description = x.description,
                    DisplayOrder = x.display_order,
                    IsActive = x.is_active
                })
                .ToListAsync();
        }

        public async Task<EmploymentTypeDto?> GetByIdAsync(int id)
        {
            var x = await _context.Set<EmploymentTypes>().FindAsync(id);
            if (x == null) return null;

            return new EmploymentTypeDto
            {
                Id = x.Id,
                Name = x.name,
                Description = x.description,
                DisplayOrder = x.display_order,
                IsActive = x.is_active
            };
        }

        public async Task<int> CreateAsync(EmploymentTypeCreateUpdateDto dto)
        {
            // Check unique name within tenant
            var exists = await _context.Set<EmploymentTypes>()
                .AnyAsync(x => x.name.ToLower() == dto.Name.ToLower());
            
            if (exists) throw new InvalidOperationException($"Hình thức làm việc '{dto.Name}' đã tồn tại trong hệ thống.");

            var entity = new EmploymentTypes
            {
                name = dto.Name,
                description = dto.Description,
                display_order = dto.DisplayOrder,
                is_active = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<EmploymentTypes>().Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(int id, EmploymentTypeCreateUpdateDto dto)
        {
            var entity = await _context.Set<EmploymentTypes>().FindAsync(id);
            if (entity == null) return false;

            // Check unique name excluding current ID
            var exists = await _context.Set<EmploymentTypes>()
                .AnyAsync(x => x.Id != id && x.name.ToLower() == dto.Name.ToLower());
            
            if (exists) throw new InvalidOperationException($"Hình thức làm việc '{dto.Name}' đã tồn tại.");

            entity.name = dto.Name;
            entity.description = dto.Description;
            entity.display_order = dto.DisplayOrder;
            entity.is_active = dto.IsActive;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Set<EmploymentTypes>().FindAsync(id);
            if (entity == null) return false;

            // AC 3.2: Check if any employee is using this type
            var usageCount = await _context.Employees.CountAsync(e => e.employment_type_id == id);
            if (usageCount > 0)
            {
                throw new InvalidOperationException($"Không thể xóa hình thức làm việc này vì đang có {usageCount} nhân viên sử dụng. Vui lòng chuyển đổi hình thức làm việc cho nhân viên trước khi xóa.");
            }

            _context.Set<EmploymentTypes>().Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
