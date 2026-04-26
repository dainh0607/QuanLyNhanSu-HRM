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

        public async Task<ShiftBusinessRulesDto> GetShiftBusinessRulesAsync()
        {
            var settings = await _context.TenantSettings
                .FirstOrDefaultAsync(x => x.tenant_id == _userContext.TenantId);

            if (settings == null)
            {
                // Return default values if not found
                return new ShiftBusinessRulesDto
                {
                    auto_schedule_next_week = true,
                    allow_shift_registration = true,
                    enable_registration_lock = false,
                    registration_lock_day = "Friday",
                    advance_schedule_weeks = 1,
                    require_shift_publish = false
                };
            }

            return new ShiftBusinessRulesDto
            {
                auto_schedule_next_week = settings.auto_schedule_next_week,
                allow_shift_registration = settings.allow_shift_registration,
                enable_registration_lock = settings.enable_registration_lock,
                registration_lock_day = settings.registration_lock_day,
                advance_schedule_weeks = settings.advance_schedule_weeks,
                require_shift_publish = settings.require_shift_publish
            };
        }

        public async Task<bool> UpdateShiftBusinessRulesAsync(UpdateShiftBusinessRulesDto dto)
        {
            var settings = await _context.TenantSettings
                .FirstOrDefaultAsync(x => x.tenant_id == _userContext.TenantId);

            if (settings == null)
            {
                settings = new TenantSettings
                {
                    tenant_id = _userContext.TenantId ?? 0,
                    CreatedAt = System.DateTime.UtcNow
                };
                _context.TenantSettings.Add(settings);
            }

            if (dto.auto_schedule_next_week.HasValue) settings.auto_schedule_next_week = dto.auto_schedule_next_week.Value;
            if (dto.allow_shift_registration.HasValue) settings.allow_shift_registration = dto.allow_shift_registration.Value;
            if (dto.enable_registration_lock.HasValue) settings.enable_registration_lock = dto.enable_registration_lock.Value;
            if (!string.IsNullOrEmpty(dto.registration_lock_day)) settings.registration_lock_day = dto.registration_lock_day;
            if (dto.advance_schedule_weeks.HasValue) settings.advance_schedule_weeks = dto.advance_schedule_weeks.Value;
            if (dto.require_shift_publish.HasValue) settings.require_shift_publish = dto.require_shift_publish.Value;

            settings.UpdatedAt = System.DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
