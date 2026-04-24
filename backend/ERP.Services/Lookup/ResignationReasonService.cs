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
    public class ResignationReasonService : IResignationReasonService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public ResignationReasonService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<PaginatedListDto<ResignationReasonDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize)
        {
            var query = _context.ResignationReasons.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(x => x.name.Contains(searchTerm) || (x.description != null && x.description.Contains(searchTerm)));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.name)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ResignationReasonDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Description = x.description,
                    IsActive = x.is_active,
                    IsDefault = x.is_default
                })
                .ToListAsync();

            return new PaginatedListDto<ResignationReasonDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<ResignationReasonDto>> GetAllAsync()
        {
            return await _context.ResignationReasons
                .Where(x => x.is_active)
                .OrderBy(x => x.name)
                .Select(x => new ResignationReasonDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Description = x.description,
                    IsActive = x.is_active,
                    IsDefault = x.is_default
                })
                .ToListAsync();
        }

        public async Task<ResignationReasonDto?> GetByIdAsync(int id)
        {
            var x = await _context.ResignationReasons.FindAsync(id);
            if (x == null) return null;

            return new ResignationReasonDto
            {
                Id = x.Id,
                Name = x.name,
                Description = x.description,
                IsActive = x.is_active,
                IsDefault = x.is_default
            };
        }

        public async Task<int> CreateAsync(ResignationReasonCreateUpdateDto dto)
        {
            var exists = await _context.ResignationReasons
                .AnyAsync(x => x.name.ToLower() == dto.Name.ToLower());
            
            if (exists) throw new InvalidOperationException($"Lý do nghỉ việc '{dto.Name}' đã tồn tại.");

            var entity = new ResignationReasons
            {
                name = dto.Name,
                description = dto.Description,
                is_active = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.ResignationReasons.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(int id, ResignationReasonCreateUpdateDto dto)
        {
            var entity = await _context.ResignationReasons.FindAsync(id);
            if (entity == null) return false;

            var exists = await _context.ResignationReasons
                .AnyAsync(x => x.Id != id && x.name.ToLower() == dto.Name.ToLower());
            
            if (exists) throw new InvalidOperationException($"Lý do nghỉ việc '{dto.Name}' đã tồn tại.");

            entity.name = dto.Name;
            entity.description = dto.Description;
            entity.is_active = dto.IsActive;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.ResignationReasons.FindAsync(id);
            if (entity == null) return false;

            // AC 3.2: Check if any employee is using this reason
            var usageCount = await _context.Employees.CountAsync(e => e.resignation_reason_id == id);
            if (usageCount > 0)
            {
                throw new InvalidOperationException($"Không thể xóa lý do này vì đã có {usageCount} hồ sơ nhân viên nghỉ việc sử dụng. Bạn chỉ có thể chỉnh sửa tên.");
            }

            _context.ResignationReasons.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
