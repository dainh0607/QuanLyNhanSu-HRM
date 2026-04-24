using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using ERP.DTOs.Settings;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Settings
{
    public class TenantSettingService : ITenantSettingService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public TenantSettingService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<TenantSortConfigDto> GetEmployeeSortConfigAsync()
        {
            var profile = await _context.TenantProfiles
                .FirstOrDefaultAsync(x => x.tenant_id == _userContext.TenantId);

            if (profile == null || string.IsNullOrEmpty(profile.default_employee_sort_config))
            {
                return new TenantSortConfigDto();
            }

            try
            {
                var config = JsonSerializer.Deserialize<List<SortRuleDto>>(profile.default_employee_sort_config);
                return new TenantSortConfigDto { Config = config ?? new List<SortRuleDto>() };
            }
            catch
            {
                return new TenantSortConfigDto();
            }
        }

        public async Task<bool> UpdateEmployeeSortConfigAsync(TenantSortConfigDto dto)
        {
            var profile = await _context.TenantProfiles
                .FirstOrDefaultAsync(x => x.tenant_id == _userContext.TenantId);

            if (profile == null) return false;

            profile.default_employee_sort_config = JsonSerializer.Serialize(dto.Config);
            profile.UpdatedAt = System.DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetEmployeeSortConfigAsync()
        {
            var profile = await _context.TenantProfiles
                .FirstOrDefaultAsync(x => x.tenant_id == _userContext.TenantId);

            if (profile == null) return false;

            profile.default_employee_sort_config = null;
            profile.UpdatedAt = System.DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
