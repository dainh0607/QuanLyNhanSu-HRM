using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (localUser == null) return null;

            var roles = await GetUserRolesAsync(localUser.Id);

            return new UserInfoDto
            {
                UserId = localUser.Id,
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
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.firebase_uid == uid);

            if (localUser == null) return null;

            var roles = await GetUserRolesAsync(localUser.Id);

            return new UserInfoDto
            {
                UserId = localUser.Id,
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
                .FirstOrDefaultAsync(u => u.firebase_uid == uid || u.username == email);
        }

        public async Task<int> SyncWithFirebaseAsync()
        {
            int syncCount = 0;
            try
            {
                _logger.LogInformation("Starting Firebase to Local DB synchronization...");
                var fbUsers = await _firebaseService.ListAllUsersAsync();

                foreach (var fbUser in fbUsers)
                {
                    var localUser = await GetLocalUserByEmailOrUidAsync(fbUser.Email, fbUser.Uid);

                    int targetRoleId = 3; // Default User
                    string masterEmail = _configuration["AdminSettings:MasterEmail"];
                    if (!string.IsNullOrEmpty(masterEmail) && 
                        string.Equals(fbUser.Email, masterEmail, StringComparison.OrdinalIgnoreCase))
                    {
                        targetRoleId = 1; // Admin
                    }

                    if (localUser == null)
                    {
                        using (var transaction = await _context.Database.BeginTransactionAsync())
                        {
                            try
                            {
                                var employeeCode = fbUser.Email?.Split('@')[0].ToUpper() ?? "EMP_" + Guid.NewGuid().ToString().Substring(0, 8);
                                var newEmployee = new ERP.Entities.Models.Employees
                                {
                                    employee_code = employeeCode,
                                    full_name = fbUser.DisplayName ?? fbUser.Email,
                                    email = fbUser.Email,
                                    phone = fbUser.PhoneNumber,
                                    is_active = true,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                };
                                _context.Employees.Add(newEmployee);
                                await _context.SaveChangesAsync();

                                var newUser = new Users
                                {
                                    employee_id = newEmployee.Id,
                                    username = fbUser.Email,
                                    firebase_uid = fbUser.Uid,
                                    is_active = true,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                };
                                _context.Users.Add(newUser);
                                await _context.SaveChangesAsync();

                                await AssignRoleInternalAsync(newUser.Id, targetRoleId);
                                await transaction.CommitAsync();
                                syncCount++;
                            }
                            catch (Exception ex)
                            {
                                await transaction.RollbackAsync();
                                _logger.LogError($"Failed to sync user {fbUser.Email}: {ex.Message}");
                            }
                        }
                    }
                    else
                    {
                        var currentRoles = await GetUserRoleIdsAsync(localUser.Id);
                        if (!currentRoles.Contains(targetRoleId))
                        {
                            await AssignRoleInternalAsync(localUser.Id, targetRoleId);
                            syncCount++;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during synchronization");
            }
            return syncCount;
        }

        public async Task<Users> CreateLocalUserAsync(int employeeId, string email, string firebaseUid)
        {
            var user = new Users
            {
                employee_id = employeeId,
                username = email,
                firebase_uid = firebaseUid,
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task AssignRoleAsync(int userId, int roleId)
        {
            await AssignRoleInternalAsync(userId, roleId);
        }

        private async Task AssignRoleInternalAsync(int userId, int roleId)
        {
            var userRole = new UserRoles
            {
                user_id = userId,
                role_id = roleId,
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
                .Where(ur => ur.user_id == userId && ur.is_active)
                .Include(ur => ur.Role)
                .Select(ur => ur.Role.name)
                .ToListAsync();
        }

        private async Task<List<int>> GetUserRoleIdsAsync(int userId)
        {
            return await _context.UserRoles
                .Where(ur => ur.user_id == userId && ur.is_active)
                .Select(ur => ur.role_id)
                .ToListAsync();
        }
    }
}
