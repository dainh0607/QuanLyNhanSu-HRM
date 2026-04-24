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
    public class OvertimeTypeService : IOvertimeTypeService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public OvertimeTypeService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<PaginatedListDto<OvertimeTypeDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize)
        {
            var query = _context.OvertimeTypes.AsQueryable();

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
                .Select(x => new OvertimeTypeDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Keyword = x.keyword,
                    RatePercentage = x.rate_percentage,
                    MonthlyLimitHours = x.monthly_limit_hours,
                    YearlyLimitHours = x.yearly_limit_hours,
                    Notes = x.notes,
                    IsActive = x.is_active,
                    DisplayOrder = x.display_order
                })
                .ToListAsync();

            return new PaginatedListDto<OvertimeTypeDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<OvertimeTypeDto>> GetAllAsync()
        {
            return await _context.OvertimeTypes
                .Where(x => x.is_active)
                .OrderBy(x => x.display_order ?? 999)
                .ThenBy(x => x.name)
                .Select(x => new OvertimeTypeDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Keyword = x.keyword,
                    RatePercentage = x.rate_percentage,
                    MonthlyLimitHours = x.monthly_limit_hours,
                    YearlyLimitHours = x.yearly_limit_hours,
                    Notes = x.notes,
                    IsActive = x.is_active,
                    DisplayOrder = x.display_order
                })
                .ToListAsync();
        }

        public async Task<OvertimeTypeDto?> GetByIdAsync(int id)
        {
            var x = await _context.OvertimeTypes.FindAsync(id);
            if (x == null) return null;

            return new OvertimeTypeDto
            {
                Id = x.Id,
                Name = x.name,
                Keyword = x.keyword,
                RatePercentage = x.rate_percentage,
                MonthlyLimitHours = x.monthly_limit_hours,
                YearlyLimitHours = x.yearly_limit_hours,
                Notes = x.notes,
                IsActive = x.is_active,
                DisplayOrder = x.display_order
            };
        }

        public async Task<int> CreateAsync(OvertimeTypeCreateUpdateDto dto)
        {
            var exists = await _context.OvertimeTypes
                .AnyAsync(x => x.keyword.ToLower() == dto.Keyword.ToLower());
            
            if (exists) throw new InvalidOperationException($"Từ khóa '{dto.Keyword}' đã tồn tại.");

            var entity = new OvertimeTypes
            {
                name = dto.Name,
                keyword = dto.Keyword,
                rate_percentage = dto.RatePercentage,
                monthly_limit_hours = dto.MonthlyLimitHours,
                yearly_limit_hours = dto.YearlyLimitHours,
                notes = dto.Notes,
                is_active = dto.IsActive,
                display_order = dto.DisplayOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.OvertimeTypes.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(int id, OvertimeTypeCreateUpdateDto dto)
        {
            var entity = await _context.OvertimeTypes.FindAsync(id);
            if (entity == null) return false;

            var exists = await _context.OvertimeTypes
                .AnyAsync(x => x.Id != id && x.keyword.ToLower() == dto.Keyword.ToLower());
            
            if (exists) throw new InvalidOperationException($"Từ khóa '{dto.Keyword}' đã tồn tại.");

            entity.name = dto.Name;
            entity.keyword = dto.Keyword;
            entity.rate_percentage = dto.RatePercentage;
            entity.monthly_limit_hours = dto.MonthlyLimitHours;
            entity.yearly_limit_hours = dto.YearlyLimitHours;
            entity.notes = dto.Notes;
            entity.is_active = dto.IsActive;
            entity.display_order = dto.DisplayOrder;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.OvertimeTypes.FindAsync(id);
            if (entity == null) return false;

            // AC 3.2: Check usage in Overtime Requests
            var requestUsage = await _context.Set<RequestOvertime>().AnyAsync(r => r.overtime_type_id == id);
            if (requestUsage)
            {
                throw new InvalidOperationException("Không thể xóa loại làm thêm này vì đã phát sinh dữ liệu chấm công/làm thêm. Bạn chỉ có thể sửa thông tin hoặc ngừng hoạt động.");
            }

            // Check usage in Payroll Details (by keyword match in component name or note)
            var payrollUsage = await _context.PayrollDetails.AnyAsync(p => 
                p.component_name.Contains(entity.keyword) || 
                (p.note != null && p.note.Contains(entity.keyword)));
            
            if (payrollUsage)
            {
                throw new InvalidOperationException("Không thể xóa loại làm thêm này vì đã được sử dụng trong bảng lương đã chốt.");
            }

            _context.OvertimeTypes.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
