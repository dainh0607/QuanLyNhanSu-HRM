using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERP.Services.Authorization
{
    public class AuthorizationManagementService : IAuthorizationManagementService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;
        private readonly ILogger<AuthorizationManagementService> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public AuthorizationManagementService(
            AppDbContext context,
            ICurrentUserContext userContext,
            ILogger<AuthorizationManagementService> logger,
            IUnitOfWork unitOfWork)
        {
            _context = context;
            _userContext = userContext;
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<RoleSummaryDto>> GetRolesAsync()
        {
            var tenantId = _userContext.TenantId;
            
            // Get roles: System roles (TenantId IS NULL) + Tenant specific roles
            // Note: Global query filter might already be filtering Roles if we implement ITenantEntity correctly
            // But we want to include system roles too.
            
            var roles = await _context.Roles
                .IgnoreQueryFilters()
                .Where(r => r.tenant_id == null || r.tenant_id == tenantId)
                .Select(r => new RoleSummaryDto
                {
                    Id = r.Id,
                    Name = r.name,
                    Description = r.description,
                    IsActive = r.is_active,
                    IsSystemRole = r.is_system_role,
                    TenantId = r.tenant_id,
                    ScopeLevel = _context.RoleScopes.Where(rs => rs.role_id == r.Id).Select(rs => rs.scope_level).FirstOrDefault() ?? "PERSONAL"
                })
                .ToListAsync();

            return roles;
        }

        public async Task<RoleSummaryDto?> GetRoleByIdAsync(int id)
        {
            var tenantId = _userContext.TenantId;
            var role = await _context.Roles
                .IgnoreQueryFilters()
                .Where(r => r.Id == id && (r.tenant_id == null || r.tenant_id == tenantId))
                .Select(r => new RoleSummaryDto
                {
                    Id = r.Id,
                    Name = r.name,
                    Description = r.description,
                    IsActive = r.is_active,
                    IsSystemRole = r.is_system_role,
                    TenantId = r.tenant_id,
                    ScopeLevel = _context.RoleScopes.Where(rs => rs.role_id == r.Id).Select(rs => rs.scope_level).FirstOrDefault() ?? "PERSONAL"
                })
                .FirstOrDefaultAsync();

            return role;
        }

        public async Task<int> CreateRoleAsync(RoleCreateUpdateDto dto)
        {
            var tenantId = _userContext.TenantId;
            
            // FIX: If no tenant, try to auto-assign default tenant
            if (!tenantId.HasValue)
            {
                var defaultTenant = await _context.Tenants.FirstOrDefaultAsync();
                if (defaultTenant != null)
                {
                    tenantId = defaultTenant.Id;
                    _logger.LogWarning($"User {_userContext.UserId} has no tenant. Auto-assigned tenant {tenantId}");
                }
                else
                {
                    throw new UnauthorizedAccessException("Không xác định được Tenant. Vui lòng liên hệ quản trị viên.");
                }
            }

            var role = new Roles
            {
                name = dto.Name,
                description = dto.Description,
                is_active = dto.IsActive,
                is_system_role = false,
                tenant_id = tenantId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Roles.AddAsync(role);
            await _context.SaveChangesAsync();

            // Create RoleScope
            var scope = new RoleScopes
            {
                role_id = role.Id,
                scope_level = dto.ScopeLevel,
                is_active = true,
                tenant_id = tenantId,
                created_at = DateTime.UtcNow
            };
            await _context.RoleScopes.AddAsync(scope);
            await _context.SaveChangesAsync();

            return role.Id;
        }

        public async Task<bool> UpdateRoleAsync(int id, RoleCreateUpdateDto dto)
        {
            var tenantId = _userContext.TenantId;
            var role = await _context.Roles.IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == id && r.tenant_id == tenantId);

            if (role == null) return false;
            if (role.is_system_role) throw new InvalidOperationException("Không thể sửa nhóm quyền hệ thống.");

            role.name = dto.Name;
            role.description = dto.Description;
            role.is_active = dto.IsActive;
            role.UpdatedAt = DateTime.UtcNow;

            var scope = await _context.RoleScopes.IgnoreQueryFilters()
                .FirstOrDefaultAsync(rs => rs.role_id == id);
            if (scope != null)
            {
                scope.scope_level = dto.ScopeLevel;
                scope.updated_at = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRoleAsync(int id)
        {
            var tenantId = _userContext.TenantId;
            var role = await _context.Roles.IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == id && r.tenant_id == tenantId);

            if (role == null) return false;
            if (role.is_system_role) throw new InvalidOperationException("Không thể xóa nhóm quyền hệ thống.");

            // Check if any users are using this role
            var inUse = await _context.UserRoles.AnyAsync(ur => ur.role_id == id && ur.is_active);
            if (inUse) throw new InvalidOperationException("Nhóm quyền này đang có người sử dụng, không thể xóa.");

            _context.Roles.Remove(role);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PermissionMappingDto> GetRolePermissionsAsync(int roleId)
        {
            var tenantId = _userContext.TenantId;
            var role = await GetRoleByIdAsync(roleId);
            if (role == null) throw new KeyNotFoundException("Không tìm thấy nhóm quyền.");

            var actions = await _context.ActionPermissions
                .IgnoreQueryFilters()
                .Where(ap => ap.role_id == roleId && (ap.tenant_id == null || ap.tenant_id == tenantId))
                .Select(ap => new ActionPermissionDto
                {
                    Action = ap.action,
                    Resource = ap.resource,
                    AllowedScope = ap.allowed_scope,
                    Description = ap.description
                })
                .ToListAsync();

            var resources = await _context.ResourcePermissions
                .IgnoreQueryFilters()
                .Where(rp => rp.role_id == roleId && (rp.tenant_id == null || rp.tenant_id == tenantId))
                .Select(rp => new ResourcePermissionDto
                {
                    ResourceName = rp.resource_name,
                    ScopeLevel = rp.scope_level
                })
                .ToListAsync();

            return new PermissionMappingDto
            {
                RoleId = roleId,
                Actions = actions,
                Resources = resources
            };
        }

        public async Task<bool> UpdateRolePermissionsAsync(PermissionMappingDto dto)
        {
            var tenantId = _userContext.TenantId;
            var role = await _context.Roles.IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == dto.RoleId && (r.tenant_id == null || r.tenant_id == tenantId));

            if (role == null) return false;
            
            // For custom roles, we can wipe and recreate. 
            // For system roles, maybe we shouldn't allow modification via this API at tenant level, 
            // OR we create tenant-specific overrides? 
            // For this phase, let's allow customization only for custom roles.
            if (role.is_system_role && tenantId.HasValue) 
                throw new InvalidOperationException("Không thể tùy chỉnh quyền của nhóm quyền hệ thống tại đây.");

            // Clear existing
            var existingActions = await _context.ActionPermissions.Where(ap => ap.role_id == dto.RoleId).ToListAsync();
            _context.ActionPermissions.RemoveRange(existingActions);

            var existingResources = await _context.ResourcePermissions.Where(rp => rp.role_id == dto.RoleId).ToListAsync();
            _context.ResourcePermissions.RemoveRange(existingResources);

            // Add new
            foreach (var act in dto.Actions)
            {
                _context.ActionPermissions.Add(new ActionPermissions
                {
                    role_id = dto.RoleId,
                    action = act.Action,
                    resource = act.Resource,
                    allowed_scope = act.AllowedScope,
                    description = act.Description,
                    tenant_id = tenantId,
                    created_at = DateTime.UtcNow
                });
            }

            foreach (var res in dto.Resources)
            {
                _context.ResourcePermissions.Add(new ResourcePermissions
                {
                    role_id = dto.RoleId,
                    resource_name = res.ResourceName,
                    scope_level = res.ScopeLevel,
                    tenant_id = tenantId,
                    created_at = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PermissionLookupDto> GetPermissionLookupsAsync()
        {
            return new PermissionLookupDto
            {
                AvailableActions = new List<string> { "CREATE", "READ", "UPDATE", "DELETE", "APPROVE", "TRANSFER", "MANAGE" },
                AvailableResources = new List<string> { "EMPLOYEE", "PAYROLL", "ATTENDANCE", "CONTRACT", "LEAVE", "SYSTEM", "ORGANIZATION" },
                AvailableScopes = new List<string> { "SAME_TENANT", "SAME_REGION", "SAME_BRANCH", "SAME_DEPARTMENT", "PERSONAL", "CROSS_REGION" }
            };
        }

        public async Task<bool> AssignRoleToUserAsync(UserRoleAssignmentDto dto)
        {
            var tenantId = _userContext.TenantId;
            
            // Basic validation
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) throw new KeyNotFoundException("Nhân viên không tồn tại.");

            var role = await _context.Roles.IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == dto.RoleId && (r.tenant_id == null || r.tenant_id == tenantId));
            if (role == null) throw new KeyNotFoundException("Nhóm quyền không tồn tại.");

            // Verify scoping if they are trying to assign branch/dept
            // A Tenant Admin can assign anything within tenant.
            
            var assignment = new UserRoles
            {
                user_id = dto.UserId,
                role_id = dto.RoleId,
                tenant_id = tenantId,
                region_id = dto.RegionId,
                branch_id = dto.BranchId,
                department_id = dto.DepartmentId,
                valid_from = dto.ValidFrom,
                valid_to = dto.ValidTo,
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                assignment_reason = dto.AssignmentReason,
                assigned_by_user_id = _userContext.UserId
            };

            await _context.UserRoles.AddAsync(assignment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RevokeRoleFromUserAsync(int userRoleId)
        {
            var tenantId = _userContext.TenantId;
            var assignment = await _context.UserRoles.FindAsync(userRoleId);
            
            if (assignment == null || assignment.tenant_id != tenantId) return false;

            assignment.is_active = false;
            assignment.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserRoleAssignmentDto>> GetUserRolesAsync(int userId)
        {
            var tenantId = _userContext.TenantId;
            return await _context.UserRoles
                .Where(ur => ur.user_id == userId && ur.tenant_id == tenantId)
                .Select(ur => new UserRoleAssignmentDto
                {
                    UserId = ur.user_id,
                    RoleId = ur.role_id,
                    RegionId = ur.region_id,
                    BranchId = ur.branch_id,
                    DepartmentId = ur.department_id,
                    ValidFrom = ur.valid_from,
                    ValidTo = ur.valid_to,
                    AssignmentReason = ur.assignment_reason
                })
                .ToListAsync();
        }
    }
}
