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
                    string masterEmail = _configuration["AdminSettings:MasterEmail"];
                    if (!string.IsNullOrEmpty(masterEmail) && 
                        string.Equals(fbUser.Email, masterEmail, StringComparison.OrdinalIgnoreCase))
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

                        // Cập nhật Firebase UID nếu trước đó chỉ có Email (do SignUp thủ công hoặc sync cũ)
                        if (string.IsNullOrEmpty(localUser.firebase_uid) || localUser.firebase_uid != fbUser.Uid)
                        {
                            localUser.firebase_uid = fbUser.Uid;
                            wasUpdated = true;
                        }

                        // Đảm bảo username đồng nhất với Email nếu có thể
                        if (!string.IsNullOrEmpty(fbUser.Email) && localUser.username != fbUser.Email)
                        {
                            // Chỉ cập nhật nếu username cũ có dạng usr_EMP_ (tức là username tự sinh)
                            // Tránh đổi username nếu người dùng đã đặt thủ công cái gì đó khác
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
                            _logger.LogInformation($"Updated existing user UID/Username during sync: {fbUser.Email}");
                            syncCount++;
                        }

                        // Kiểm tra vai trò
                        var currentRoles = await GetUserRoleIdsAsync(localUser.Id);
                        if (!currentRoles.Contains(targetRoleId))
                        {
                            await AssignRoleInternalAsync(localUser.Id, targetRoleId, localUser.tenant_id, "Firebase Sync (Role Update)");
                            syncCount++;
                        }
                    }
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

        private async Task AssignRoleInternalAsync(int userId, int roleId, int? tenantId = null, string? assignmentReason = null)
        {
            var existingRole = await _context.UserRoles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(ur => ur.user_id == userId && ur.role_id == roleId);

            if (existingRole != null)
            {
                if (!existingRole.is_active)
                {
                    existingRole.is_active = true;
                    existingRole.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                return;
            }

            var userRole = new UserRoles
            {
                user_id = userId,
                role_id = roleId,
                tenant_id = tenantId,
                assignment_reason = assignmentReason ?? "System Assignment",
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();
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
