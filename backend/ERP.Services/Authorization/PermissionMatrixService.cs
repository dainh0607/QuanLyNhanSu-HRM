using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Authorization
{
    public class PermissionMatrixService : IPermissionMatrixService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public PermissionMatrixService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<PermissionMatrixDto> GetMatrixByModuleAsync(string moduleCode)
        {
            var tenantId = _userContext.TenantId;
            var module = ModuleFeatures.Modules.FirstOrDefault(m => m.Code == moduleCode);
            if (module == null) throw new ArgumentException("Module không tồn tại");

            // Get all roles for this tenant (including system roles)
            var roles = await _context.Roles
                .IgnoreQueryFilters()
                .Where(r => r.tenant_id == null || r.tenant_id == tenantId)
                .Select(r => new RoleSummaryDto
                {
                    Id = r.Id,
                    Name = r.name,
                    IsSystemRole = r.is_system_role
                })
                .ToListAsync();

            // Get current feature permissions for these roles and features
            var featureCodes = module.Features.Select(f => f.Code).ToList();
            var roleIds = roles.Select(r => r.Id).ToList();

            var permissions = await _context.Set<FeaturePermissions>()
                .Where(p => roleIds.Contains(p.role_id) && featureCodes.Contains(p.feature_code))
                .ToListAsync();

            var permissionValues = new List<FeaturePermissionValueDto>();

            foreach (var role in roles)
            {
                foreach (var feature in module.Features)
                {
                    var perm = permissions.FirstOrDefault(p => p.role_id == role.Id && p.feature_code == feature.Code);
                    
                    // Admin logic: AC 2.3 - Admin has full access by default
                    bool isGranted = false;
                    if (role.Name == "Admin" || role.Name == "SuperAdmin")
                    {
                        isGranted = true;
                    }
                    else if (perm != null)
                    {
                        isGranted = perm.is_granted;
                    }

                    permissionValues.Add(new FeaturePermissionValueDto
                    {
                        RoleId = role.Id,
                        FeatureCode = feature.Code,
                        IsGranted = isGranted
                    });
                }
            }

            return new PermissionMatrixDto
            {
                ModuleCode = module.Code,
                ModuleName = module.Name,
                Features = module.Features.Select(f => new FeatureInfoDto { Code = f.Code, Name = f.Name }).ToList(),
                Roles = roles,
                PermissionValues = permissionValues
            };
        }

        public async Task<bool> UpdateMatrixAsync(PermissionMatrixUpdateDto dto)
        {
            var tenantId = _userContext.TenantId;
            if (!tenantId.HasValue) throw new UnauthorizedAccessException("Tenant context missing");

            var module = ModuleFeatures.Modules.FirstOrDefault(m => m.Code == dto.ModuleCode);
            if (module == null) throw new ArgumentException("Module không tồn tại");

            var featureCodes = module.Features.Select(f => f.Code).ToList();

            foreach (var val in dto.PermissionValues)
            {
                // Validate if feature belongs to module
                if (!featureCodes.Contains(val.FeatureCode)) continue;

                // Check if role belongs to tenant or is system role
                var role = await _context.Roles.IgnoreQueryFilters()
                    .FirstOrDefaultAsync(r => r.Id == val.RoleId && (r.tenant_id == null || r.tenant_id == tenantId));
                
                if (role == null) continue;

                // AC 2.3: Admin permissions are immutable (always granted)
                if (role.name == "Admin" || role.name == "SuperAdmin") continue;

                var existing = await _context.Set<FeaturePermissions>()
                    .FirstOrDefaultAsync(p => p.role_id == val.RoleId && p.feature_code == val.FeatureCode);

                if (existing != null)
                {
                    existing.is_granted = val.IsGranted;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    _context.Set<FeaturePermissions>().Add(new FeaturePermissions
                    {
                        tenant_id = tenantId,
                        role_id = val.RoleId,
                        feature_code = val.FeatureCode,
                        is_granted = val.IsGranted,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
