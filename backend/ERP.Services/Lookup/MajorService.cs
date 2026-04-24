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
    public class MajorService : IMajorService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public MajorService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<PaginatedListDto<MajorDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize)
        {
            var query = _context.Set<Majors>().AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(x => x.name.Contains(searchTerm) || (x.description != null && x.description.Contains(searchTerm)));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.name)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new MajorDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Description = x.description,
                    IsActive = x.is_active
                })
                .ToListAsync();

            return new PaginatedListDto<MajorDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<MajorDto>> GetAllAsync()
        {
            return await _context.Set<Majors>()
                .Where(x => x.is_active)
                .OrderBy(x => x.name)
                .Select(x => new MajorDto
                {
                    Id = x.Id,
                    Name = x.name,
                    Description = x.description,
                    IsActive = x.is_active
                })
                .ToListAsync();
        }

        public async Task<MajorDto?> GetByIdAsync(int id)
        {
            var x = await _context.Set<Majors>().FindAsync(id);
            if (x == null) return null;

            return new MajorDto
            {
                Id = x.Id,
                Name = x.name,
                Description = x.description,
                IsActive = x.is_active
            };
        }

        public async Task<int> CreateAsync(MajorCreateUpdateDto dto)
        {
            // Check unique name within tenant
            var exists = await _context.Set<Majors>()
                .AnyAsync(x => x.name.ToLower() == dto.Name.ToLower());
            
            if (exists) throw new InvalidOperationException($"Chuyên ngành '{dto.Name}' đã tồn tại trong hệ thống.");

            var entity = new Majors
            {
                name = dto.Name,
                description = dto.Description,
                is_active = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<Majors>().Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(int id, MajorCreateUpdateDto dto)
        {
            var entity = await _context.Set<Majors>().FindAsync(id);
            if (entity == null) return false;

            // Check unique name excluding current ID
            var exists = await _context.Set<Majors>()
                .AnyAsync(x => x.Id != id && x.name.ToLower() == dto.Name.ToLower());
            
            if (exists) throw new InvalidOperationException($"Chuyên ngành '{dto.Name}' đã tồn tại.");

            entity.name = dto.Name;
            entity.description = dto.Description;
            entity.is_active = dto.IsActive;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Set<Majors>().FindAsync(id);
            if (entity == null) return false;

            // AC 3.2: Check if any education record is using this major
            var usageCount = await _context.Set<Education>().CountAsync(e => e.major_id == id);
            if (usageCount > 0)
            {
                throw new InvalidOperationException($"Không thể xóa chuyên ngành này vì đang có {usageCount} hồ sơ học vấn sử dụng. Vui lòng cập nhật hồ sơ liên quan trước khi xóa.");
            }

            _context.Set<Majors>().Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
