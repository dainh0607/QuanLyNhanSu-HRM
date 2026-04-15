using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace ERP.Services.Authorization
{
    /// <summary>
    /// FIX #10: Immutable audit log service for permission changes
    /// Logs all role assignments, revocations, scope changes
    /// </summary>
    public interface IPermissionAuditLogService
    {
        Task LogRoleAssignment(int targetUserId, int roleId, int performedByUserId, 
            string scopeDetails, string reason, HttpContext context);
        
        Task LogRoleRevocation(int targetUserId, int roleId, int performedByUserId, 
            string scopeDetails, string reason, HttpContext context);
        
        Task LogScopeChange(int targetUserId, int roleId, 
            string oldScopeDetails, string newScopeDetails, 
            int performedByUserId, string reason, HttpContext context);
        
        Task<List<PermissionAuditLogs>> GetAuditLogsByUser(int userId, DateTime? fromDate = null, DateTime? toDate = null);
        
        Task<List<PermissionAuditLogs>> GetAuditLogsByPerformer(int performedByUserId, DateTime? fromDate = null);
    }

    public class PermissionAuditLogService : IPermissionAuditLogService
    {
        private readonly AppDbContext _context;
        private readonly IUnitOfWork _unitOfWork;

        public PermissionAuditLogService(AppDbContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// FIX #10: Log when a role is assigned to a user
        /// </summary>
        public async Task LogRoleAssignment(int targetUserId, int roleId, int performedByUserId,
            string scopeDetails, string reason, HttpContext context)
        {
            var auditLog = new PermissionAuditLogs
            {
                action_type = "ASSIGN_ROLE",
                target_user_id = targetUserId,
                performed_by_user_id = performedByUserId,
                role_id = roleId,
                scope_details = scopeDetails,
                reason = reason,
                ip_address = GetClientIpAddress(context),
                user_agent = context?.Request.Headers["User-Agent"].ToString(),
                created_at = DateTime.UtcNow,
                is_immutable = true
            };

            _context.PermissionAuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// FIX #10: Log when a role is revoked
        /// </summary>
        public async Task LogRoleRevocation(int targetUserId, int roleId, int performedByUserId,
            string scopeDetails, string reason, HttpContext context)
        {
            var auditLog = new PermissionAuditLogs
            {
                action_type = "REVOKE_ROLE",
                target_user_id = targetUserId,
                performed_by_user_id = performedByUserId,
                role_id = roleId,
                scope_details = scopeDetails,
                reason = reason,
                ip_address = GetClientIpAddress(context),
                user_agent = context?.Request.Headers["User-Agent"].ToString(),
                created_at = DateTime.UtcNow,
                is_immutable = true
            };

            _context.PermissionAuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// FIX #10: Log when scope is changed (e.g., change from Region1 to Region2)
        /// </summary>
        public async Task LogScopeChange(int targetUserId, int roleId,
            string oldScopeDetails, string newScopeDetails,
            int performedByUserId, string reason, HttpContext context)
        {
            var auditLog = new PermissionAuditLogs
            {
                action_type = "CHANGE_SCOPE",
                target_user_id = targetUserId,
                performed_by_user_id = performedByUserId,
                role_id = roleId,
                old_scope_details = oldScopeDetails,
                scope_details = newScopeDetails,
                reason = reason,
                ip_address = GetClientIpAddress(context),
                user_agent = context?.Request.Headers["User-Agent"].ToString(),
                created_at = DateTime.UtcNow,
                is_immutable = true
            };

            _context.PermissionAuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// FIX #10: Retrieve audit logs for a specific user (SYSTEM ADMIN ONLY)
        /// </summary>
        public async Task<List<PermissionAuditLogs>> GetAuditLogsByUser(int userId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.PermissionAuditLogs
                .Where(log => log.target_user_id == userId);

            if (fromDate.HasValue)
                query = query.Where(log => log.created_at >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(log => log.created_at <= toDate.Value);

            var ordered = query.OrderByDescending(log => log.created_at);
            return await ordered.ToListAsync();
        }

        /// <summary>
        /// FIX #10: Retrieve audit logs for a specific performer (who made the changes)
        /// </summary>
        public async Task<List<PermissionAuditLogs>> GetAuditLogsByPerformer(int performedByUserId, DateTime? fromDate = null)
        {
            var query = _context.PermissionAuditLogs
                .Where(log => log.performed_by_user_id == performedByUserId);

            if (fromDate.HasValue)
                query = query.Where(log => log.created_at >= fromDate.Value);

            var ordered = query.OrderByDescending(log => log.created_at);
            return await ordered.ToListAsync();
        }

        private string GetClientIpAddress(HttpContext context)
        {
            if (context == null) return "UNKNOWN";

            if (context.Request.Headers.ContainsKey("X-Forwarded-For"))
                return context.Request.Headers["X-Forwarded-For"].ToString();

            return context.Connection?.RemoteIpAddress?.ToString() ?? "UNKNOWN";
        }
    }
}
