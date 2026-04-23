using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EmployeeEntity = ERP.Entities.Models.Employees;

using Microsoft.Extensions.Configuration;

namespace ERP.Services.Auth
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UserService> _logger;
        private readonly IFirebaseService _firebaseService;
        private readonly IConfiguration _configuration;

        public UserService(AppDbContext context, ILogger<UserService> logger, IFirebaseService firebaseService, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _firebaseService = firebaseService;
            _configuration = configuration;
        }

        public async Task<UserInfoDto?> GetByIdAsync(int id)
        {
            var localUser = await _context.Users
                .IgnoreQueryFilters()
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (localUser == null) return null;

            var roles = await GetUserRolesAsync(localUser.Id);

            return new UserInfoDto
            {
                UserId = localUser.Id,
                TenantId = localUser.tenant_id,
                EmployeeId = localUser.employee_id,
                Email = localUser.username,
                FullName = localUser.Employee?.full_name ?? localUser.username,
                EmployeeCode = localUser.Employee?.employee_code,
                PhoneNumber = localUser.Employee?.phone,
                IsActive = localUser.is_active,
                Roles = roles
            };
        }

        public async Task<UserInfoDto?> GetByUidAsync(string uid)
        {
            var localUser = await _context.Users
                .IgnoreQueryFilters()
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.firebase_uid == uid);

            if (localUser == null) return null;

            var roles = await GetUserRolesAsync(localUser.Id);

            return new UserInfoDto
            {
                UserId = localUser.Id,
                TenantId = localUser.tenant_id,
                EmployeeId = localUser.Employee?.Id ?? 0,
                Email = localUser.Employee?.email ?? localUser.username,
                FullName = localUser.Employee?.full_name ?? localUser.username,
                EmployeeCode = localUser.Employee?.employee_code,
                PhoneNumber = localUser.Employee?.phone,
                IsActive = localUser.is_active,
                Roles = roles
            };
        }

        public async Task<Users?> GetLocalUserByEmailOrUidAsync(string email, string uid)
        {
            return await _context.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.firebase_uid == uid || u.username == email);
        }

        public async Task<int> SyncWithFirebaseAsync()
        {
            if (FirebaseAdmin.FirebaseApp.DefaultInstance == null)
            {
                _logger.LogWarning("Firebase App not initialized. Skipping SyncWithFirebaseAsync.");
                return 0;
            }

            int syncCount = 0;
            try
            {
                _logger.LogInformation("Starting Firebase to Local DB synchronization...");
                var fbUsers = await _firebaseService.ListAllUsersAsync();

                foreach (var fbUser in fbUsers)
                {
                    // 1. Tìm kiếm User hiện có: Ưu tiên theo UID, sau đó đến Email
                    var localUser = await _context.Users
                        .IgnoreQueryFilters()
                        .Include(u => u.Employee)
                        .FirstOrDefaultAsync(u => u.firebase_uid == fbUser.Uid);

                    if (localUser == null && !string.IsNullOrEmpty(fbUser.Email))
                    {
                        localUser = await _context.Users
                            .IgnoreQueryFilters()
                            .Include(u => u.Employee)
                            .FirstOrDefaultAsync(u => u.username == fbUser.Email);
                    }

                    int targetRoleId = 2; // Default Manager
                    string masterEmailSetting = _configuration["AdminSettings:MasterEmail"];
                    if (!string.IsNullOrEmpty(masterEmailSetting) && 
                        string.Equals(fbUser.Email, masterEmailSetting, StringComparison.OrdinalIgnoreCase))
                    {
                        targetRoleId = 1; // Admin
                    }

                    if (localUser == null)
                    {
                        // TRƯỜNG HỢP 1: USER CHƯA TỒN TẠI - TẠO MỚI
                        using (var transaction = await _context.Database.BeginTransactionAsync())
                        {
                            try
                            {
                                var employeeCode = fbUser.Email?.Split('@')[0].ToUpper() ?? "EMP_" + Guid.NewGuid().ToString("N").Substring(0, 8);
                                
                                var defaultTenant = await _context.Tenants.FirstOrDefaultAsync() ?? 
                                    new Tenants { 
                                        name = "Default Workspace", 
                                        code = "DEFAULT",
                                        is_active = true,
                                        CreatedAt = DateTime.UtcNow
                                    };
                                
                                if (defaultTenant.Id == 0)
                                {
                                    _context.Tenants.Add(defaultTenant);
                                    await _context.SaveChangesAsync();
                                }
                                
                                var newEmployee = new EmployeeEntity
                                {
                                    employee_code = employeeCode,
                                    full_name = fbUser.DisplayName ?? fbUser.Email,
                                    email = fbUser.Email,
                                    phone = fbUser.PhoneNumber,
                                    tenant_id = defaultTenant.Id,
                                    is_active = true,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                };
                                _context.Employees.Add(newEmployee);
                                await _context.SaveChangesAsync();

                                var newUser = new Users
                                {
                                    employee_id = newEmployee.Id,
                                    username = fbUser.Email ?? employeeCode, // Ưu tiên Email làm username
                                    firebase_uid = fbUser.Uid,
                                    is_active = true,
                                    tenant_id = defaultTenant.Id,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                };
                                _context.Users.Add(newUser);
                                await _context.SaveChangesAsync();

                                await AssignRoleInternalAsync(newUser.Id, targetRoleId, defaultTenant.Id, "Firebase Sync (New)");
                                await transaction.CommitAsync();
                                
                                _logger.LogInformation($"Synced NEW user from Firebase: {fbUser.Email}");
                                syncCount++;
                            }
                            catch (Exception ex)
                            {
                                await transaction.RollbackAsync();
                                _logger.LogError($"Failed to sync NEW user {fbUser.Email}: {ex.Message}");
                            }
                        }
                    }
                    else
                    {
                        // TRƯỜNG HỢP 2: USER ĐÃ TỒN TẠI - CẬP NHẬT THÔNG TIN
                        bool wasUpdated = false;

                        // Cập nhật Firebase UID nếu trước đó chỉ có Email
                        if (string.IsNullOrEmpty(localUser.firebase_uid) || localUser.firebase_uid != fbUser.Uid)
                        {
                            localUser.firebase_uid = fbUser.Uid;
                            wasUpdated = true;
                        }

                        // Đảm bảo username đồng nhất với Email nếu có thể
                        if (!string.IsNullOrEmpty(fbUser.Email) && localUser.username != fbUser.Email)
                        {
                            if (localUser.username.StartsWith("usr_EMP_", StringComparison.OrdinalIgnoreCase))
                            {
                                localUser.username = fbUser.Email;
                                wasUpdated = true;
                            }
                        }

                        if (wasUpdated)
                        {
                            localUser.UpdatedAt = DateTime.UtcNow;
                            await _context.SaveChangesAsync();
                            _logger.LogInformation($"Updated existing user during sync: {fbUser.Email}");
                            syncCount++;
                        }

                        // Kiểm tra vai trò
                        var currentRoles = await GetUserRoleIdsAsync(localUser.Id);
                        if (!currentRoles.Contains(targetRoleId) && (targetRoleId == 1 || !currentRoles.Contains(1)))
                        {
                            await AssignRoleInternalAsync(localUser.Id, targetRoleId, localUser.tenant_id, "Firebase Sync (Role Update)");
                            syncCount++;
                        }
                    }
                }

                // PRUNING LOGIC: Remove/Deactivate local users NOT in Firebase
                var firebaseUids = fbUsers.Select(u => u.Uid).ToHashSet();
                string masterEmailPrune = _configuration["AdminSettings:MasterEmail"];

                var localUsersToPrune = await _context.Users
                    .IgnoreQueryFilters()
                    .Include(u => u.Employee)
                    .Where(u => !string.IsNullOrEmpty(u.firebase_uid) && !firebaseUids.Contains(u.firebase_uid))
                    .ToListAsync();

                foreach (var user in localUsersToPrune)
                {
                    // Skip if master email
                    if (!string.IsNullOrEmpty(masterEmailPrune) && 
                        string.Equals(user.username, masterEmailPrune, StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    if (user.is_active)
                    {
                        _logger.LogWarning($"User {user.username} (UID: {user.firebase_uid}) not found in Firebase. Deactivating locally.");
                        user.is_active = false;
                        user.UpdatedAt = DateTime.UtcNow;
                        
                        if (user.Employee != null)
                        {
                            user.Employee.is_active = false;
                            user.Employee.UpdatedAt = DateTime.UtcNow;
                        }
                        syncCount++;
                    }
                }
                
                if (syncCount > 0)
                {
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during Firebase synchronization");
            }
            return syncCount;
        }

        public async Task<Users> CreateLocalUserAsync(int employeeId, string email, string firebaseUid, int? tenantId = null)
        {
            var user = new Users
            {
                employee_id = employeeId,
                username = email,
                firebase_uid = firebaseUid,
                is_active = true,
                tenant_id = tenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task AssignRoleAsync(int userId, int roleId, int? tenantId = null, string? assignmentReason = null)
        {
            await AssignRoleInternalAsync(userId, roleId, tenantId, assignmentReason);
        }

        public async Task AssignScopedRoleAsync(int userId, int roleId, int? tenantId = null, string? assignmentReason = null, int? branchId = null, int? regionId = null, int? departmentId = null)
        {
            await AssignRoleInternalAsync(userId, roleId, tenantId, assignmentReason, branchId, regionId, departmentId);
        }

        private async Task AssignRoleInternalAsync(int userId, int roleId, int? tenantId = null, string? assignmentReason = null, int? branchId = null, int? regionId = null, int? departmentId = null)
        {
            var resolvedRoleId = await ResolveRoleIdForAssignmentAsync(roleId);

            var existingRole = await _context.UserRoles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(ur => ur.user_id == userId && ur.role_id == resolvedRoleId);

            if (existingRole != null)
            {
                if (!existingRole.is_active)
                {
                    existingRole.is_active = true;
                    existingRole.UpdatedAt = DateTime.UtcNow;
                    
                    // Update scoping if provided
                    if (branchId.HasValue) existingRole.branch_id = branchId;
                    if (regionId.HasValue) existingRole.region_id = regionId;
                    if (departmentId.HasValue) existingRole.department_id = departmentId;

                    await _context.SaveChangesAsync();
                }
                return;
            }

            var userRole = new UserRoles
            {
                user_id = userId,
                role_id = resolvedRoleId,
                tenant_id = tenantId,
                assignment_reason = assignmentReason ?? "System Assignment",
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                branch_id = branchId,
                region_id = regionId,
                department_id = departmentId
            };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();
        }

        private async Task<int> ResolveRoleIdForAssignmentAsync(int requestedRoleId)
        {
            var exactRole = await _context.Roles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == requestedRoleId);

            if (exactRole != null)
            {
                await EnsureRoleMetadataAsync(exactRole, requestedRoleId);
                return exactRole.Id;
            }

            var fallbackNames = GetFallbackRoleNames(requestedRoleId);
            if (fallbackNames.Count > 0)
            {
                var normalizedNames = fallbackNames
                    .Select(name => name.ToLowerInvariant())
                    .ToList();

                var fallbackRole = await _context.Roles
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(r => r.name != null && normalizedNames.Contains(r.name.ToLower()));

                if (fallbackRole != null)
                {
                    await EnsureRoleMetadataAsync(fallbackRole, requestedRoleId);

                    _logger.LogWarning(
                        "Requested role ID {RequestedRoleId} was not found. Falling back to existing role {ResolvedRoleId} ({RoleName}).",
                        requestedRoleId,
                        fallbackRole.Id,
                        fallbackRole.name);

                    return fallbackRole.Id;
                }

                var createdRole = await CreateCanonicalRoleAsync(requestedRoleId);
                await EnsureRoleScopeAsync(createdRole.Id, requestedRoleId);
                return createdRole.Id;
            }

            throw new InvalidOperationException(
                $"Role ID {requestedRoleId} does not exist in Roles table. Insert was blocked before hitting FK_UserRoles_Roles_role_id.");
        }

        private async Task EnsureRoleMetadataAsync(Roles role, int requestedRoleId)
        {
            var needsSave = false;

            if (!role.is_active)
            {
                role.is_active = true;
                role.UpdatedAt = DateTime.UtcNow;
                needsSave = true;
            }

            if (needsSave)
            {
                await _context.SaveChangesAsync();
            }

            await EnsureRoleScopeAsync(role.Id, requestedRoleId);
        }

        private async Task<Roles> CreateCanonicalRoleAsync(int requestedRoleId)
        {
            var roleName = GetCanonicalRoleName(requestedRoleId)
                ?? throw new InvalidOperationException($"Role ID {requestedRoleId} does not exist in Roles table.");
            var description = GetCanonicalRoleDescription(requestedRoleId);
            var now = DateTime.UtcNow;

            try
            {
                if (string.Equals(_context.Database.ProviderName, "Microsoft.EntityFrameworkCore.SqlServer", StringComparison.OrdinalIgnoreCase))
                {
                    await _context.Database.ExecuteSqlInterpolatedAsync($@"
SET IDENTITY_INSERT [Roles] ON;
INSERT INTO [Roles] ([id], [tenant_id], [is_system_role], [name], [description], [is_active], [created_at], [updated_at])
VALUES ({requestedRoleId}, {(int?)null}, {true}, {roleName}, {description}, {true}, {now}, {now});
SET IDENTITY_INSERT [Roles] OFF;");
                }
                else
                {
                    _context.Roles.Add(new Roles
                    {
                        Id = requestedRoleId,
                        tenant_id = null,
                        is_system_role = true,
                        name = roleName,
                        description = description,
                        is_active = true,
                        CreatedAt = now,
                        UpdatedAt = now
                    });

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Failed to create canonical role {RoleName} with requested ID {RoleId}. Trying to recover via name lookup.",
                    roleName,
                    requestedRoleId);
            }

            var createdRole = await _context.Roles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => r.Id == requestedRoleId || r.name == roleName);

            if (createdRole == null)
            {
                throw new InvalidOperationException(
                    $"Unable to create or resolve role {roleName} for requested ID {requestedRoleId}.");
            }

            if (!createdRole.is_active)
            {
                createdRole.is_active = true;
                createdRole.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return createdRole;
        }

        private async Task EnsureRoleScopeAsync(int actualRoleId, int requestedRoleId)
        {
            if (!TryGetRoleScopeDefinition(requestedRoleId, out var scopeLevel, out var isHierarchical, out var crossRegionModules))
            {
                return;
            }

            var existingScope = await _context.RoleScopes
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(rs => rs.role_id == actualRoleId);

            if (existingScope != null)
            {
                var needsSave = false;

                if (!existingScope.is_active)
                {
                    existingScope.is_active = true;
                    needsSave = true;
                }

                if (!string.Equals(existingScope.scope_level, scopeLevel, StringComparison.OrdinalIgnoreCase))
                {
                    existingScope.scope_level = scopeLevel;
                    needsSave = true;
                }

                if (existingScope.is_hierarchical != isHierarchical)
                {
                    existingScope.is_hierarchical = isHierarchical;
                    needsSave = true;
                }

                if (existingScope.cross_region_modules != crossRegionModules)
                {
                    existingScope.cross_region_modules = crossRegionModules;
                    needsSave = true;
                }

                if (needsSave)
                {
                    existingScope.updated_at = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return;
            }

            _context.RoleScopes.Add(new RoleScopes
            {
                role_id = actualRoleId,
                scope_level = scopeLevel,
                is_hierarchical = isHierarchical,
                cross_region_modules = crossRegionModules,
                is_active = true,
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        private static IReadOnlyList<string> GetFallbackRoleNames(int requestedRoleId)
        {
            var canonicalName = GetCanonicalRoleName(requestedRoleId);
            if (canonicalName == null)
            {
                return Array.Empty<string>();
            }

            return requestedRoleId switch
            {
                AuthSecurityConstants.RoleSuperAdminId => new[] { AuthSecurityConstants.RoleSuperAdmin, AuthSecurityConstants.RoleAdmin },
                AuthSecurityConstants.RoleEmployeeId => new[] { AuthSecurityConstants.RoleEmployee, "User", "Employee" },
                AuthSecurityConstants.RoleAdminId => new[] { AuthSecurityConstants.RoleAdmin, "System Administrator" },
                _ => new[] { canonicalName }
            };
        }

        private static string? GetCanonicalRoleName(int requestedRoleId)
        {
            return requestedRoleId switch
            {
                AuthSecurityConstants.RoleSuperAdminId => AuthSecurityConstants.RoleSuperAdmin,
                AuthSecurityConstants.RoleDirectorId => AuthSecurityConstants.RoleDirector,
                AuthSecurityConstants.RoleRegionManagerId => AuthSecurityConstants.RoleRegionManager,
                AuthSecurityConstants.RoleBranchManagerId => AuthSecurityConstants.RoleBranchManager,
                AuthSecurityConstants.RoleDeptManagerId => AuthSecurityConstants.RoleDeptManager,
                AuthSecurityConstants.RoleModuleAdminId => AuthSecurityConstants.RoleModuleAdmin,
                AuthSecurityConstants.RoleEmployeeId => AuthSecurityConstants.RoleEmployee,
                AuthSecurityConstants.RoleAdminId => AuthSecurityConstants.RoleAdmin,
                _ => null
            };
        }

        private static string GetCanonicalRoleDescription(int requestedRoleId)
        {
            return requestedRoleId switch
            {
                AuthSecurityConstants.RoleSuperAdminId => "Platform Level Administrator",
                AuthSecurityConstants.RoleDirectorId => "Executive Board / Manager",
                AuthSecurityConstants.RoleRegionManagerId => "Regional Manager",
                AuthSecurityConstants.RoleBranchManagerId => "Branch Manager",
                AuthSecurityConstants.RoleDeptManagerId => "Department/Unit Head",
                AuthSecurityConstants.RoleModuleAdminId => "Module Specialist Admin",
                AuthSecurityConstants.RoleEmployeeId => "Regular Employee Staff",
                AuthSecurityConstants.RoleAdminId => "Workspace Administrator",
                _ => "System Role"
            };
        }

        private static bool TryGetRoleScopeDefinition(
            int requestedRoleId,
            out string scopeLevel,
            out bool isHierarchical,
            out string? crossRegionModules)
        {
            crossRegionModules = null;

            switch (requestedRoleId)
            {
                case AuthSecurityConstants.RoleSuperAdminId:
                case AuthSecurityConstants.RoleDirectorId:
                case AuthSecurityConstants.RoleAdminId:
                    scopeLevel = "TENANT";
                    isHierarchical = true;
                    return true;
                case AuthSecurityConstants.RoleRegionManagerId:
                    scopeLevel = "REGION";
                    isHierarchical = true;
                    return true;
                case AuthSecurityConstants.RoleBranchManagerId:
                    scopeLevel = "BRANCH";
                    isHierarchical = true;
                    return true;
                case AuthSecurityConstants.RoleDeptManagerId:
                    scopeLevel = "DEPARTMENT";
                    isHierarchical = true;
                    return true;
                case AuthSecurityConstants.RoleModuleAdminId:
                    scopeLevel = "CROSS_REGION";
                    isHierarchical = false;
                    crossRegionModules = "Payroll,Attendance";
                    return true;
                case AuthSecurityConstants.RoleEmployeeId:
                    scopeLevel = "PERSONAL";
                    isHierarchical = false;
                    return true;
                default:
                    scopeLevel = string.Empty;
                    isHierarchical = false;
                    return false;
            }
        }

        private async Task<List<string>> GetUserRolesAsync(int userId)
        {
            return await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == userId && ur.is_active)
                .Include(ur => ur.Role)
                .Select(ur => ur.Role.name)
                .ToListAsync();
        }

        private async Task<List<int>> GetUserRoleIdsAsync(int userId)
        {
            return await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == userId && ur.is_active)
                .Select(ur => ur.role_id)
                .ToListAsync();
        }
    }
}
