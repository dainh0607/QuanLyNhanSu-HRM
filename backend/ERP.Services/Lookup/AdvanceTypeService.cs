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
    public class AdvanceTypeService : IAdvanceTypeService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public AdvanceTypeService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<PaginatedListDto<AdvanceTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize)
        {
            var query = _context.AdvanceTypes.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(x => x.name.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.display_order ?? 999)
                .ThenBy(x => x.name)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new AdvanceTypeDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Description = x.description,
                    IsActive = x.is_active,
                    DisplayOrder = x.display_order
                })
                .ToListAsync();

            return new PaginatedListDto<AdvanceTypeDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<AdvanceTypeDto>> GetAllAsync()
        {
            return await _context.AdvanceTypes
                .Where(x => x.is_active)
                .OrderBy(x => x.display_order ?? 999)
                .ThenBy(x => x.name)
                .Select(x => new AdvanceTypeDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Description = x.description,
                    IsActive = x.is_active,
                    DisplayOrder = x.display_order
                })
                .ToListAsync();
        }

        public async Task<AdvanceTypeDto?> GetByIdAsync(int id)
        {
            var x = await _context.AdvanceTypes.FindAsync(id);
            if (x == null) return null;

            return new AdvanceTypeDto
            {
                Id = x.Id,
                Name = x.name,
                Description = x.description,
                IsActive = x.is_active,
                DisplayOrder = x.display_order
            };
        }

        public async Task<int> CreateAsync(AdvanceTypeCreateUpdateDto dto)
        {
            var exists = await _context.AdvanceTypes
                .AnyAsync(x => x.name.ToLower() == dto.Name.ToLower());
            
            if (exists) throw new InvalidOperationException($"Loại tạm ứng '{dto.Name}' đã tồn tại.");

            var entity = new AdvanceTypes
            {
                name = dto.Name,
                description = dto.Description,
                is_active = dto.IsActive,
                display_order = dto.DisplayOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.AdvanceTypes.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(int id, AdvanceTypeCreateUpdateDto dto)
        {
            var entity = await _context.AdvanceTypes.FindAsync(id);
            if (entity == null) return false;

            var exists = await _context.AdvanceTypes
                .AnyAsync(x => x.Id != id && x.name.ToLower() == dto.Name.ToLower());
            
            if (exists) throw new InvalidOperationException($"Loại tạm ứng '{dto.Name}' đã tồn tại.");

            entity.name = dto.Name;
            entity.description = dto.Description;
            entity.is_active = dto.IsActive;
            entity.display_order = dto.DisplayOrder;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.AdvanceTypes.FindAsync(id);
            if (entity == null) return false;

            // AC 3.2: Check usage in Advance Requests
            var usageCount = await _context.Set<RequestSalaryAdvances>().CountAsync(r => r.advance_type_id == id);
            if (usageCount > 0)
            {
                throw new InvalidOperationException($"Không thể xóa loại tạm ứng này vì đã phát sinh {usageCount} đơn từ tài chính của nhân viên. Bạn chỉ có thể sửa thông tin.");
            }

            _context.AdvanceTypes.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
