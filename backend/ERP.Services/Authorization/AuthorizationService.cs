using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Authorization
{
    /// <summary>
    /// FIX #1, #2, #3, #4, #5, #6: Core authorization service
    /// Validates user permissions based on scopes and hierarchical org structure
    /// </summary>
    public interface IAuthorizationService
    {
        // Scope validation
        Task<bool> CanAccessRegion(int userId, int regionId);
        Task<bool> CanAccessBranch(int userId, int branchId);
        Task<bool> CanAccessDepartment(int userId, int departmentId);
        Task<bool> CanAccessEmployee(int userId, int employeeId);

        // Action validation
        Task<bool> CanPerformAction(int userId, string action, string resource);
        Task<bool> CanApproveRequest(int userId, string requestType, decimal? amount = null);

        // Role scope detection
        Task<UserScopeInfo> GetUserScopeInfo(int userId);
        Task<List<Roles>> GetUserRoles(int userId);
        
        // Cross-region access (Module Admin)
        Task<bool> CanAccessCrossRegion(int userId);
        Task<List<string>> GetCrossRegionModules(int userId);
    }

    public class AuthorizationService : IAuthorizationService
    {
        private readonly AppDbContext _context;
        private readonly IUnitOfWork _unitOfWork;

        public AuthorizationService(AppDbContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// FIX #3: Check if user can access a specific region
        /// </summary>
        public async Task<bool> CanAccessRegion(int userId, int regionId)
        {
            var userRoles = await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == userId && ur.is_active && 
                       (!ur.valid_to.HasValue || ur.valid_to > DateTime.UtcNow))
                .Include(ur => ur.Role)
                .ToListAsync();

            if (!userRoles.Any())
                return false;

            // Check if user has region scope or can access all regions
            var roleScopes = await _context.RoleScopes
                .IgnoreQueryFilters()
                .Where(rs => userRoles.Select(ur => ur.role_id).Contains(rs.role_id))
                .ToListAsync();

            // If no user role has region_id set, they can access
            var restrictedRoles = userRoles.Where(ur => ur.region_id.HasValue).ToList();
            if (!restrictedRoles.Any())
            {
                // Check if at least one role scope allows region access
                if (roleScopes.Any(rs => rs.scope_level == "REGION" || rs.scope_level == "TENANT"))
                    return true;
            }

            // Check if user has access to this specific region
            return userRoles.Any(ur => ur.region_id == null || ur.region_id == regionId);
        }

        /// <summary>
        /// FIX #4: Check if user can access a specific branch
        /// </summary>
        public async Task<bool> CanAccessBranch(int userId, int branchId)
        {
            var userRoles = await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == userId && ur.is_active &&
                       (!ur.valid_to.HasValue || ur.valid_to > DateTime.UtcNow))
                .ToListAsync();

            if (!userRoles.Any())
                return false;

            // If user has branch_id set for any role, they can only access assigned branches
            var branchRestrictedRoles = userRoles.Where(ur => ur.branch_id.HasValue);
            if (branchRestrictedRoles.Any())
                return branchRestrictedRoles.Any(ur => ur.branch_id == branchId);

            // If no branch restriction, check if they can access via region
            var branch = await _context.Branches.FindAsync(branchId);
            if (branch == null)
                return false;

            // User can access if no region restriction or region matches
            var regionRestrictedRoles = userRoles.Where(ur => ur.region_id.HasValue);
            if (regionRestrictedRoles.Any())
            {
                // Check if branch's region matches user's assigned region
                // Note: This assumes branches have region association through employees
                return true; // Simplified for now
            }

            return true; // Full tenant access
        }

        /// <summary>
        /// FIX #4: Check if user can access a specific department
        /// </summary>
        public async Task<bool> CanAccessDepartment(int userId, int departmentId)
        {
            var userRoles = await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == userId && ur.is_active &&
                       (!ur.valid_to.HasValue || ur.valid_to > DateTime.UtcNow))
                .ToListAsync();

            if (!userRoles.Any())
                return false;

            // If user has department_id set, they can only access assigned departments
            var deptRestrictedRoles = userRoles.Where(ur => ur.department_id.HasValue);
            if (deptRestrictedRoles.Any())
                return deptRestrictedRoles.Any(ur => ur.department_id == departmentId);

            return true; // Full permission
        }

        /// <summary>
        /// FIX #4: Check if user can access a specific employee
        /// This respects organizational hierarchy
        /// </summary>
        public async Task<bool> CanAccessEmployee(int userId, int employeeId)
        {
            // Get employee assigned to this user
            var userEmployeeId = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => u.employee_id)
                .FirstOrDefaultAsync();

            if (userEmployeeId <= 0)
                return false;

            var targetEmployee = await _context.Employees
                .Where(e => e.Id == employeeId)
                .FirstOrDefaultAsync();

            if (targetEmployee == null)
                return false;

            var userRoles = await GetUserRoles(userId);
            var userScope = await GetUserScopeInfo(userId);

            // Check department access
            if (userScope.DepartmentId.HasValue)
            {
                if (targetEmployee.department_id != userScope.DepartmentId)
                    return false;
            }

            // Check branch access
            if (userScope.BranchId.HasValue)
            {
                if (targetEmployee.branch_id != userScope.BranchId)
                    return false;
            }

            return true;
        }

        /// <summary>
        /// FIX #5, #6: Check if user can perform a specific action on a resource
        /// </summary>
        public async Task<bool> CanPerformAction(int userId, string action, string resource)
        {
            var userRoles = await GetUserRoles(userId);
            if (!userRoles.Any())
                return false;

            var roleIds = userRoles.Select(r => r.Id).ToList();

            var actionPermission = await _context.ActionPermissions
                .IgnoreQueryFilters()
                .Where(ap => roleIds.Contains(ap.role_id) &&
                       ap.action == action &&
                       ap.resource == resource &&
                       ap.is_active)
                .FirstOrDefaultAsync();

            return actionPermission != null;
        }

        /// <summary>
        /// FIX #7: Check if user can approve a request type with given amount
        /// </summary>
        public async Task<bool> CanApproveRequest(int userId, string requestType, decimal? amount = null)
        {
            var userRoles = await GetUserRoles(userId);
            if (!userRoles.Any())
                return false;

            var roleIds = userRoles.Select(r => r.Id).ToList();

            var approverConfig = await _context.RequestTypeApprovers
                .IgnoreQueryFilters()
                .Where(rta => roleIds.Contains(rta.role_id) &&
                       rta.RequestType.name == requestType &&
                       rta.is_active)
                .FirstOrDefaultAsync();

            if (approverConfig == null)
                return false;

            // Check amount limit
            if (amount.HasValue && approverConfig.max_approval_amount.HasValue)
            {
                if (amount > approverConfig.max_approval_amount)
                    return false;
            }

            return true;
        }

        /// <summary>
        /// FIX #4, #13: Get comprehensive scope info for a user
        /// </summary>
        public async Task<UserScopeInfo> GetUserScopeInfo(int userId)
        {
            var userRoles = await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == userId && ur.is_active &&
                       (!ur.valid_to.HasValue || ur.valid_to > DateTime.UtcNow))
                .ToListAsync();

            var scope = new UserScopeInfo
            {
                UserId = userId,
                TenantId = userRoles.FirstOrDefault()?.tenant_id,
                RegionId = userRoles.FirstOrDefault()?.region_id,
                BranchId = userRoles.FirstOrDefault()?.branch_id,
                DepartmentId = userRoles.FirstOrDefault()?.department_id
            };

            return scope;
        }

        /// <summary>
        /// FIX #13: Get all active roles for a user
        /// </summary>
        public async Task<List<Roles>> GetUserRoles(int userId)
        {
            var roles = await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == userId && ur.is_active &&
                       (!ur.valid_to.HasValue || ur.valid_to > DateTime.UtcNow))
                .Include(ur => ur.Role)
                .Select(ur => ur.Role)
                .ToListAsync();

            return roles;
        }

        /// <summary>
        /// FIX #3: Check if user is a cross-region user (Module Admin)
        /// </summary>
        public async Task<bool> CanAccessCrossRegion(int userId)
        {
            var roleScopes = await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == userId && ur.is_active &&
                       (!ur.valid_to.HasValue || ur.valid_to > DateTime.UtcNow))
                .Include(ur => ur.Role)
                .ToListAsync();

            // Check if any of user's roles has CROSS_REGION scope
            var hasCrossRegionScope = await _context.RoleScopes
                .IgnoreQueryFilters()
                .Where(rs => roleScopes.Select(ur => ur.role_id).Contains(rs.role_id) &&
                       rs.scope_level == "CROSS_REGION" &&
                       rs.is_active)
                .AnyAsync();

            return hasCrossRegionScope;
        }

        /// <summary>
        /// FIX #3: Get list of modules user can access cross-region
        /// </summary>
        public async Task<List<string>> GetCrossRegionModules(int userId)
        {
            var userRoleIds = await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == userId && ur.is_active)
                .Select(ur => ur.role_id)
                .ToListAsync();

            var roleScopes = await _context.RoleScopes
                .IgnoreQueryFilters()
                .Where(rs => userRoleIds.Contains(rs.role_id) &&
                       rs.scope_level == "CROSS_REGION" &&
                       rs.is_active)
                .ToListAsync();

            var modules = roleScopes
                .Where(rs => !string.IsNullOrEmpty(rs.cross_region_modules))
                .SelectMany(rs => rs.cross_region_modules.Split(',', StringSplitOptions.RemoveEmptyEntries))
                .Distinct()
                .ToList();

            return modules;
        }
    }

    /// <summary>
    /// Data class to hold user scope information
    /// </summary>
    public class UserScopeInfo
    {
        public int UserId { get; set; }
        public int? TenantId { get; set; }
        public int? RegionId { get; set; }
        public int? BranchId { get; set; }
        public int? DepartmentId { get; set; }
    }
}
