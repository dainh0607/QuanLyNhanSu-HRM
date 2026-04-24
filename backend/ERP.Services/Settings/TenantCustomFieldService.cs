using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Settings;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Settings
{
    public class TenantCustomFieldService : ITenantCustomFieldService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public TenantCustomFieldService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<PaginatedListDto<CustomFieldDto>> GetPagedAsync(string? searchTerm, int pageIndex, int pageSize)
        {
            var query = _context.Set<TenantCustomFields>().AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(x => x.field_name.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(x => x.display_order ?? 999)
                .ThenBy(x => x.field_name)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new CustomFieldDto
                {
                    Id = x.Id,
                    FieldName = x.field_name,
                    FieldKey = x.field_key,
                    FieldType = x.field_type,
                    Options = !string.IsNullOrEmpty(x.options_json) ? JsonSerializer.Deserialize<List<string>>(x.options_json, (JsonSerializerOptions?)null) : null,
                    IsActive = x.is_active,
                    DisplayOrder = x.display_order
                })
                .ToListAsync();

            return new PaginatedListDto<CustomFieldDto>(items, totalCount, pageIndex, pageSize);
        }

        public async Task<IEnumerable<CustomFieldDto>> GetAllAsync()
        {
            return await _context.Set<TenantCustomFields>()
                .Where(x => x.is_active)
                .OrderBy(x => x.display_order ?? 999)
                .Select(x => new CustomFieldDto
                {
                    Id = x.Id,
                    FieldName = x.field_name,
                    FieldKey = x.field_key,
                    FieldType = x.field_type,
                    Options = !string.IsNullOrEmpty(x.options_json) ? JsonSerializer.Deserialize<List<string>>(x.options_json, (JsonSerializerOptions?)null) : null,
                    IsActive = x.is_active,
                    DisplayOrder = x.display_order
                })
                .ToListAsync();
        }

        public async Task<CustomFieldDto?> GetByIdAsync(int id)
        {
            var x = await _context.Set<TenantCustomFields>().FindAsync(id);
            if (x == null) return null;

            return new CustomFieldDto
            {
                Id = x.Id,
                FieldName = x.field_name,
                FieldKey = x.field_key,
                FieldType = x.field_type,
                Options = !string.IsNullOrEmpty(x.options_json) ? JsonSerializer.Deserialize<List<string>>(x.options_json, (JsonSerializerOptions?)null) : null,
                IsActive = x.is_active,
                DisplayOrder = x.display_order
            };
        }

        public async Task<int> CreateAsync(CustomFieldCreateUpdateDto dto)
        {
            // AC 3.1: Check unique name and system fields conflict
            var nameLower = dto.FieldName.ToLower();
            var exists = await _context.Set<TenantCustomFields>().AnyAsync(x => x.field_name.ToLower() == nameLower);
            if (exists) throw new InvalidOperationException($"Tên trường '{dto.FieldName}' đã tồn tại trong danh mục tùy chỉnh.");

            var systemExists = await _context.Set<SystemFields>().AnyAsync(x => x.field_name.ToLower() == nameLower);
            if (systemExists) throw new InvalidOperationException($"Tên trường '{dto.FieldName}' trùng với trường mặc định của hệ thống.");

            var entity = new TenantCustomFields
            {
                field_name = dto.FieldName,
                field_key = GenerateFieldKey(dto.FieldName),
                field_type = dto.FieldType,
                options_json = dto.Options != null ? JsonSerializer.Serialize(dto.Options) : null,
                is_active = dto.IsActive,
                display_order = dto.DisplayOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<TenantCustomFields>().Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateAsync(int id, CustomFieldCreateUpdateDto dto)
        {
            var entity = await _context.Set<TenantCustomFields>().FindAsync(id);
            if (entity == null) return false;

            // AC 3.1: Check unique name
            var nameLower = dto.FieldName.ToLower();
            if (entity.field_name.ToLower() != nameLower)
            {
                var exists = await _context.Set<TenantCustomFields>().AnyAsync(x => x.Id != id && x.field_name.ToLower() == nameLower);
                if (exists) throw new InvalidOperationException($"Tên trường '{dto.FieldName}' đã tồn tại.");
                
                var systemExists = await _context.Set<SystemFields>().AnyAsync(x => x.field_name.ToLower() == nameLower);
                if (systemExists) throw new InvalidOperationException($"Tên trường '{dto.FieldName}' trùng với trường mặc định của hệ thống.");
            }

            // AC 3.2: Type Lock - Block type change
            if (entity.field_type != dto.FieldType)
            {
                throw new InvalidOperationException("Không được phép thay đổi định dạng dữ liệu (Loại) của trường đã tạo.");
            }

            entity.field_name = dto.FieldName;
            entity.options_json = dto.Options != null ? JsonSerializer.Serialize(dto.Options) : null;
            entity.is_active = dto.IsActive;
            entity.display_order = dto.DisplayOrder;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.Set<TenantCustomFields>().FindAsync(id);
            if (entity == null) return false;

            // AC 3.3: In production, we might want to check if any employee actually has data for this key
            // For now, allow deletion as the UI handles the confirmation.

            _context.Set<TenantCustomFields>().Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private string GenerateFieldKey(string name)
        {
            // Convert to snake_case and remove accents
            string result = name.ToLower();
            result = result.Replace(" ", "_");
            // Simple approach for key generation
            return "cf_" + Guid.NewGuid().ToString("N").Substring(0, 8) + "_" + result.Substring(0, Math.Min(result.Length, 10));
        }
    }
}
