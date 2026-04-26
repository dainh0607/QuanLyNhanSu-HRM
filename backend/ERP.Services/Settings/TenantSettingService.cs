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
            var tenantId = _userContext.TenantId;
            if (!tenantId.HasValue) return new ShiftBusinessRulesDto { RegistrationLockDay = "Friday", AdvanceScheduleWeeks = 1 };

            var settings = await _context.TenantSettings
                .FirstOrDefaultAsync(x => x.tenant_id == tenantId.Value);

            if (settings == null)
            {
                // Return default values if not found
                return new ShiftBusinessRulesDto
                {
                    AutoScheduleNextWeek = true,
                    AllowShiftRegistration = true,
                    EnableRegistrationLock = false,
                    RegistrationLockDay = "Friday",
                    AdvanceScheduleWeeks = 1,
                    RequireShiftPublish = false
                };
            }

            return new ShiftBusinessRulesDto
            {
                AutoScheduleNextWeek = settings.auto_schedule_next_week,
                AllowShiftRegistration = settings.allow_shift_registration,
                EnableRegistrationLock = settings.enable_registration_lock,
                RegistrationLockDay = settings.registration_lock_day,
                AdvanceScheduleWeeks = settings.advance_schedule_weeks,
                RequireShiftPublish = settings.require_shift_publish
            };
        }

        public async Task<bool> UpdateShiftBusinessRulesAsync(UpdateShiftBusinessRulesDto dto)
        {
            var tenantId = _userContext.TenantId;
            if (!tenantId.HasValue) return false;

            var settings = await _context.TenantSettings
                .FirstOrDefaultAsync(x => x.tenant_id == tenantId.Value);

            if (settings == null)
            {
                settings = new TenantSettings
                {
                    id = tenantId.Value,
                    tenant_id = tenantId.Value,
                    CreatedAt = System.DateTime.UtcNow
                };
                _context.TenantSettings.Add(settings);
            }

            if (dto.AutoScheduleNextWeek.HasValue) settings.auto_schedule_next_week = dto.AutoScheduleNextWeek.Value;
            if (dto.AllowShiftRegistration.HasValue) settings.allow_shift_registration = dto.AllowShiftRegistration.Value;
            if (dto.EnableRegistrationLock.HasValue) settings.enable_registration_lock = dto.EnableRegistrationLock.Value;
            if (!string.IsNullOrEmpty(dto.RegistrationLockDay)) settings.registration_lock_day = dto.RegistrationLockDay;
            if (dto.AdvanceScheduleWeeks.HasValue) settings.advance_schedule_weeks = dto.AdvanceScheduleWeeks.Value;
            if (dto.RequireShiftPublish.HasValue) settings.require_shift_publish = dto.RequireShiftPublish.Value;

            settings.UpdatedAt = System.DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
