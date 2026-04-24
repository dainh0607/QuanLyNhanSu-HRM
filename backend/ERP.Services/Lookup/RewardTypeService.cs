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
    public class RewardTypeService : IRewardTypeService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public RewardTypeService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<PaginatedListDto<RewardTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize)
        {
            var query = _context.RewardTypes.AsQueryable();

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
                .Select(x => new RewardTypeDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Keyword = x.keyword,
                    Description = x.description,
                    IsActive = x.is_active,
                    DisplayOrder = x.display_order
                })
                .ToListAsync();

            return new PaginatedListDto<RewardTypeDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<RewardTypeDto>> GetAllAsync()
        {
            return await _context.RewardTypes
                .Where(x => x.is_active)
                .OrderBy(x => x.display_order ?? 999)
                .ThenBy(x => x.name)
                .Select(x => new RewardTypeDto
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

        public async Task<RewardTypeDto?> GetByIdAsync(int id)
        {
            var x = await _context.RewardTypes.FindAsync(id);
            if (x == null) return null;

            return new RewardTypeDto
            {
                Id = x.Id,
                Name = x.name,
                Keyword = x.keyword,
                Description = x.description,
                IsActive = x.is_active,
                DisplayOrder = x.display_order
            };
        }

        public async Task<int> CreateAsync(RewardTypeCreateUpdateDto dto)
        {
            var exists = await _context.RewardTypes
                .AnyAsync(x => x.keyword.ToLower() == dto.Keyword.ToLower());
            
            if (exists) throw new InvalidOperationException($"Từ khóa khen thưởng '{dto.Keyword}' đã tồn tại.");

            var entity = new RewardTypes
            {
                name = dto.Name,
                keyword = dto.Keyword,
                description = dto.Description,
                is_active = dto.IsActive,
                display_order = dto.DisplayOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.RewardTypes.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(int id, RewardTypeCreateUpdateDto dto)
        {
            var entity = await _context.RewardTypes.FindAsync(id);
            if (entity == null) return false;

            var exists = await _context.RewardTypes
                .AnyAsync(x => x.Id != id && x.keyword.ToLower() == dto.Keyword.ToLower());
            
            if (exists) throw new InvalidOperationException($"Từ khóa khen thưởng '{dto.Keyword}' đã tồn tại.");

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
            var entity = await _context.RewardTypes.FindAsync(id);
            if (entity == null) return false;

            // AC 3.2: Check usage in Employee Rewards
            var usageCount = await _context.Set<RequestRewards>().CountAsync(r => r.reward_type_id == id);
            if (usageCount > 0)
            {
                throw new InvalidOperationException($"Không thể xóa hình thức khen thưởng này vì đã phát sinh {usageCount} hồ sơ khen thưởng của nhân viên. Bạn chỉ có thể sửa thông tin.");
            }

            // Check payroll usage
            var payrollUsage = await _context.PayrollDetails.AnyAsync(p => p.component_name.Contains(entity.keyword));
            if (payrollUsage)
            {
                throw new InvalidOperationException("Không thể xóa hình thức khen thưởng này vì đã được sử dụng trong công thức tính lương.");
            }

            _context.RewardTypes.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
