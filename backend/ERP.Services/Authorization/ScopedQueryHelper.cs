using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.Entities;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;
using EmployeeEntity = ERP.Entities.Models.Employees;

namespace ERP.Services.Authorization
{
    /// <summary>
    /// Helper to apply scope-based filtering to queries
    /// FIX #7: Data-level security - restrict queries based on user role scopes
    /// 
    /// Scope Hierarchy:
    /// TENANT (global) > REGION > BRANCH > DEPARTMENT > PERSONAL (self only)
    /// </summary>
    public interface IScopedQueryHelper
    {
        /// <summary>
        /// Apply scope filtering to employee queries
        /// Returns filtered IQueryable that respects user's role scopes
        /// </summary>
        Task<IQueryable<EmployeeEntity>> ApplyEmployeeScopeFilter(
            IQueryable<EmployeeEntity> query, 
            int userId,
            int tenantId);

        /// <summary>
        /// Get scope info for a user (used to filter which records they can see)
        /// </summary>
        Task<ScopeFilterInfo> GetUserScopeInfo(int userId, int tenantId);
    }

    public class ScopeFilterInfo
    {
        /// <summary>
        /// User's scope level: TENANT, REGION, BRANCH, DEPARTMENT, PERSONAL
        /// </summary>
        public string ScopeLevel { get; set; } = "PERSONAL";

        /// <summary>
        /// User's employee ID (for PERSONAL scope filtering)
        /// </summary>
        public int? UserEmployeeId { get; set; }

        /// <summary>
        /// Region IDs user can access (null = all)
        /// </summary>
        public List<int> AllowedRegionIds { get; set; } = new();

        /// <summary>
        /// Branch IDs user can access (null = all)
        /// </summary>
        public List<int> AllowedBranchIds { get; set; } = new();

        /// <summary>
        /// Department IDs user can access (null = all)
        /// </summary>
        public List<int> AllowedDepartmentIds { get; set; } = new();

        /// <summary>
        /// True if user can access without scope restrictions
        /// </summary>
        public bool HasUnrestrictedAccess { get; set; }
    }

    public class ScopedQueryHelper : IScopedQueryHelper
    {
        private readonly AppDbContext _context;

        public ScopedQueryHelper(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Main method: Apply scope filtering to employee queries
        /// </summary>
        public async Task<IQueryable<EmployeeEntity>> ApplyEmployeeScopeFilter(
            IQueryable<EmployeeEntity> query, 
            int userId,
            int tenantId)
        {
            var scopeInfo = await GetUserScopeInfo(userId, tenantId);

            // If no scope restrictions (e.g., Admin with TENANT scope)
            if (scopeInfo.HasUnrestrictedAccess)
                return query;

            // Apply scope-based filtering
            return scopeInfo.ScopeLevel.ToUpper() switch
            {
                // PERSONAL: Only their own employee record
                "PERSONAL" when scopeInfo.UserEmployeeId.HasValue =>
                    query.Where(e => e.Id == scopeInfo.UserEmployeeId.Value),

                // DEPARTMENT: Only employees in user's department(s)
                "DEPARTMENT" when scopeInfo.AllowedDepartmentIds?.Any() == true =>
                    query.Where(e => e.department_id.HasValue && scopeInfo.AllowedDepartmentIds.Contains(e.department_id.Value)),
                "DEPARTMENT" =>
                    query.Where(e => false), // No departments assigned - deny all

                // BRANCH: Employees in user's branch(es)
                "BRANCH" when scopeInfo.AllowedBranchIds?.Any() == true =>
                    query.Where(e => e.branch_id.HasValue && scopeInfo.AllowedBranchIds.Contains(e.branch_id.Value)),
                "BRANCH" =>
                    query.Where(e => false), // No branches assigned - deny all

                // REGION: Employees in user's region(s)
                "REGION" when scopeInfo.AllowedRegionIds?.Any() == true =>
                    query.Where(e => e.region_id.HasValue && scopeInfo.AllowedRegionIds.Contains(e.region_id.Value)),
                "REGION" =>
                    query.Where(e => false), // No regions assigned - deny all

                // TENANT: All employees (no filter)
                "TENANT" => query,

                // Default: Deny all for unknown scopes
                _ => query.Where(e => false)
            };
        }

        /// <summary>
        /// Get scope info for a user
        /// </summary>
        public async Task<ScopeFilterInfo> GetUserScopeInfo(int userId, int tenantId)
        {
            var result = new ScopeFilterInfo
            {
                AllowedRegionIds = new List<int>(),
                AllowedBranchIds = new List<int>(),
                AllowedDepartmentIds = new List<int>(),
                HasUnrestrictedAccess = false
            };

            // Get user's employee association
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return result; // Return restrictive defaults

            result.UserEmployeeId = user.employee_id;

            // Get user's active roles with their scope constraints
            var userRoles = await _context.UserRoles
                .AsNoTracking()
                .Where(ur => ur.user_id == userId && 
                       (ur.tenant_id == tenantId || ur.tenant_id == null) &&
                       ur.is_active &&
                       (!ur.valid_to.HasValue || ur.valid_to > DateTime.UtcNow))
                .Include(ur => ur.Role)
                .ToListAsync();

            if (!userRoles.Any())
                return result; // User has no roles - restrictive access

            // Get role scopes to determine overall scope level
            var roleIds = userRoles.Select(ur => ur.role_id).Distinct().ToList();
            var roleScopes = await _context.RoleScopes
                .AsNoTracking()
                .Where(rs => roleIds.Contains(rs.role_id))
                .ToListAsync();

            // Determine the most permissive scope level
            // Hierarchy: TENANT > REGION > BRANCH > DEPARTMENT > PERSONAL
            var scopeLevel = DetermineScopeLevel(roleScopes);
            result.ScopeLevel = scopeLevel;

            // If TENANT scope, no further restrictions needed
            if (scopeLevel == "TENANT")
            {
                result.HasUnrestrictedAccess = true;
                return result;
            }

            // Collect scope constraints from user roles
            var regionIds = userRoles.Where(ur => ur.region_id.HasValue)
                .Select(ur => ur.region_id.Value)
                .Distinct()
                .ToList();

            var branchIds = userRoles.Where(ur => ur.branch_id.HasValue)
                .Select(ur => ur.branch_id.Value)
                .Distinct()
                .ToList();

            var departmentIds = userRoles.Where(ur => ur.department_id.HasValue)
                .Select(ur => ur.department_id.Value)
                .Distinct()
                .ToList();

            // Apply hierarchy-based logic
            switch (scopeLevel)
            {
                case "REGION":
                    // If regions are explicitly set, use them; otherwise allow all
                    if (regionIds.Any())
                    {
                        result.AllowedRegionIds = regionIds;
                    }
                    else
                    {
                        result.HasUnrestrictedAccess = true; // Regional manager without region restriction
                    }
                    break;

                case "BRANCH":
                    if (branchIds.Any())
                    {
                        result.AllowedBranchIds = branchIds;
                    }
                    else
                    {
                        result.HasUnrestrictedAccess = true; // Branch manager without explicit restriction
                    }
                    break;

                case "DEPARTMENT":
                    if (departmentIds.Any())
                    {
                        result.AllowedDepartmentIds = departmentIds;
                    }
                    else if (user.employee_id > 0)
                    {
                        // Get employee's department
                        var employee = await _context.Employees
                            .AsNoTracking()
                            .FirstOrDefaultAsync(e => e.Id == user.employee_id);

                        if (employee?.department_id.HasValue == true)
                            result.AllowedDepartmentIds.Add(employee.department_id.Value);
                    }
                    break;

                case "PERSONAL":
                    // Only see own record
                    // No need to populate lists for PERSONAL scope - filtering is by UserEmployeeId
                    break;
            }

            return result;
        }

        /// <summary>
        /// Determine the most permissive scope level from user's roles
        /// </summary>
        private string DetermineScopeLevel(List<RoleScopes> roleScopes)
        {
            if (!roleScopes.Any())
                return "PERSONAL"; // Default to most restrictive

            // Priority: TENANT > REGION > BRANCH > DEPARTMENT > PERSONAL
            var scopePriority = new Dictionary<string, int>
            {
                { "TENANT", 5 },
                { "CROSS_REGION", 4 },
                { "REGION", 3 },
                { "BRANCH", 2 },
                { "DEPARTMENT", 1 },
                { "PERSONAL", 0 }
            };

            var highestPriority = roleScopes
                .Select(rs => rs.scope_level ?? "PERSONAL")
                .Select(scope => scopePriority.ContainsKey(scope) ? scopePriority[scope] : 0)
                .Max();

            return scopePriority.FirstOrDefault(kvp => kvp.Value == highestPriority).Key ?? "PERSONAL";
        }
    }
}
