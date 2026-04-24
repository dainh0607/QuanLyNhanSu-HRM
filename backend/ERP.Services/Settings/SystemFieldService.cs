using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Settings;
using ERP.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Settings
{
    public class SystemFieldService : ISystemFieldService
    {
        private readonly AppDbContext _context;

        public SystemFieldService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SystemFieldGroupDto>> GetDefaultFieldsAsync()
        {
            var fields = await _context.Set<Entities.Models.SystemFields>()
                .OrderBy(x => x.category)
                .ThenBy(x => x.display_order)
                .ToListAsync();

            return fields.GroupBy(x => x.category)
                .Select(g => new SystemFieldGroupDto
                {
                    Category = g.Key,
                    TotalFields = g.Count(),
                    Fields = g.Select(f => new SystemFieldDto
                    {
                        Id = f.Id,
                        FieldName = f.field_name,
                        FieldType = f.field_type
                    }).ToList()
                })
                .ToList();
        }
    }
}
