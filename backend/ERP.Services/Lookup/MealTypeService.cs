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
    public class MealTypeService : IMealTypeService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public MealTypeService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<PaginatedListDto<MealTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize)
        {
            var query = _context.MealTypes.AsQueryable();

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
                .Select(x => new MealTypeDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Keyword = x.keyword,
                    Description = x.description,
                    IsActive = x.is_active,
                    DisplayOrder = x.display_order
                })
                .ToListAsync();

            return new PaginatedListDto<MealTypeDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<MealTypeDto>> GetAllAsync()
        {
            return await _context.MealTypes
                .Where(x => x.is_active)
                .OrderBy(x => x.display_order ?? 999)
                .ThenBy(x => x.name)
                .Select(x => new MealTypeDto
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

        public async Task<MealTypeDto?> GetByIdAsync(int id)
        {
            var x = await _context.MealTypes.FindAsync(id);
            if (x == null) return null;

            return new MealTypeDto
            {
                Id = x.Id,
                Name = x.name,
                Keyword = x.keyword,
                Description = x.description,
                IsActive = x.is_active,
                DisplayOrder = x.display_order
            };
        }

        public async Task<int> CreateAsync(MealTypeCreateUpdateDto dto)
        {
            var exists = await _context.MealTypes
                .AnyAsync(x => x.keyword.ToLower() == dto.Keyword.ToLower());
            
            if (exists) throw new InvalidOperationException($"Từ khóa khẩu phần ăn '{dto.Keyword}' đã tồn tại.");

            var entity = new MealTypes
            {
                name = dto.Name,
                keyword = dto.Keyword,
                description = dto.Description,
                is_active = dto.IsActive,
                display_order = dto.DisplayOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.MealTypes.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(int id, MealTypeCreateUpdateDto dto)
        {
            var entity = await _context.MealTypes.FindAsync(id);
            if (entity == null) return false;

            var exists = await _context.MealTypes
                .AnyAsync(x => x.Id != id && x.keyword.ToLower() == dto.Keyword.ToLower());
            
            if (exists) throw new InvalidOperationException($"Từ khóa khẩu phần ăn '{dto.Keyword}' đã tồn tại.");

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
            var entity = await _context.MealTypes.FindAsync(id);
            if (entity == null) return false;

            // AC 3.2: Check usage in Shifts
            var shiftUsage = await _context.Shifts.AnyAsync(s => s.meal_type_id == id);
            if (shiftUsage)
            {
                throw new InvalidOperationException("Không thể xóa khẩu phần ăn này vì đang được sử dụng trong cấu hình Ca làm việc.");
            }

            // Check usage in Meal Requests
            var requestUsage = await _context.Set<RequestMeals>().AnyAsync(r => r.meal_type_id == id);
            if (requestUsage)
            {
                throw new InvalidOperationException("Không thể xóa khẩu phần ăn này vì đã phát sinh hồ sơ đăng ký suất ăn.");
            }

            // Check usage in Payroll
            var payrollUsage = await _context.PayrollDetails.AnyAsync(p => p.component_name.Contains(entity.keyword));
            if (payrollUsage)
            {
                throw new InvalidOperationException("Không thể xóa khẩu phần ăn này vì đang được sử dụng trong cấu hình Bảng lương.");
            }

            _context.MealTypes.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
