using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace ERP.Services.Authorization
{
    /// <summary>
    /// FIX #11: Break-glass emergency account management
    /// Handles secure access, forced password changes, and audit logging
    /// </summary>
    public interface IBreakGlassService
    {
        Task<bool> ActivateBreakGlassSession(int userId, string reason, HttpContext context);
        Task<bool> CompleteBreakGlassSession(int userId, List<string> actionsPerformed, HttpContext context);
        Task<bool> ForcePasswordChangeAfterEmergency(int userId);
        Task LockBreakGlassAccountAfterUse(int userId);
        Task<bool> IsBreakGlassAccountCredValid(int userId);
        Task<BreakGlassAccessLogs> GetLastBreakGlassAccess(int userId);
        Task<List<BreakGlassAccessLogs>> GetAllBreakGlassAccessLogs(int userId);
    }

    public class BreakGlassService : IBreakGlassService
    {
        private readonly AppDbContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private const int PASSWORD_CHANGE_DAYS = 24 * 30; // 24 months

        public BreakGlassService(AppDbContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// FIX #11: Start a break-glass emergency session
        /// Requirements:
        /// - User must be break-glass account
        /// - Must log reason
        /// - Must be approved by System Admin (future implementation)
        /// </summary>
        public async Task<bool> ActivateBreakGlassSession(int userId, string reason, HttpContext context)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.is_break_glass_account)
                return false;

            // Create session log
            var log = new BreakGlassAccessLogs
            {
                user_id = userId,
                login_time = DateTime.UtcNow,
                ip_address = GetClientIpAddress(context),
                user_agent = context?.Request.Headers["User-Agent"].ToString(),
                reason_for_access = reason
            };

            _context.BreakGlassAccessLogs.Add(log);
            user.last_emergency_access_at = DateTime.UtcNow;
            user.force_password_change_after_emergency = true;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// FIX #11: Complete break-glass session and log actions
        /// </summary>
        public async Task<bool> CompleteBreakGlassSession(int userId, List<string> actionsPerformed, HttpContext context)
        {
            var lastLog = await _context.BreakGlassAccessLogs
                .Where(log => log.user_id == userId && log.logout_time == null)
                .OrderByDescending(log => log.login_time)
                .FirstOrDefaultAsync();

            if (lastLog == null)
                return false;

            lastLog.logout_time = DateTime.UtcNow;
            lastLog.actions_performed = string.Join(",", actionsPerformed);

            _context.BreakGlassAccessLogs.Update(lastLog);
            await _context.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// FIX #11, #15: Enforce password change after emergency access
        /// Password must be changed within 24 hours, new password must be stored securely
        /// </summary>
        public async Task<bool> ForcePasswordChangeAfterEmergency(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            user.requires_password_change = true;
            user.force_password_change_after_emergency = true;
            user.password_expires_at = DateTime.UtcNow.AddHours(24); // 24 hours to change

            _context.Users.Update(user);

            // Log the forced change requirement
            var lastLog = await _context.BreakGlassAccessLogs
                .Where(log => log.user_id == userId)
                .OrderByDescending(log => log.login_time)
                .FirstOrDefaultAsync();

            if (lastLog != null)
            {
                lastLog.password_changed_after_access = true;
                lastLog.password_change_forced_at = DateTime.UtcNow;
                _context.BreakGlassAccessLogs.Update(lastLog);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// FIX #11: Lock break-glass account after emergency access
        /// Must be unlocked by higher authority (Tenant Admin or System Admin)
        /// </summary>
        public async Task LockBreakGlassAccountAfterUse(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return;

            user.is_locked = true;
            user.locked_until = DateTime.UtcNow.AddDays(365); // Default 1 year lock

            var lastLog = await _context.BreakGlassAccessLogs
                .Where(log => log.user_id == userId)
                .OrderByDescending(log => log.login_time)
                .FirstOrDefaultAsync();

            if (lastLog != null)
            {
                lastLog.is_account_locked_after = true;
                _context.BreakGlassAccessLogs.Update(lastLog);
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// FIX #11, #15: Check if break-glass credentials are still valid for use
        /// Must validate:
        /// - Account is not locked
        /// - Password hasn't expired
        /// - No pending forced password change
        /// </summary>
        public async Task<bool> IsBreakGlassAccountCredValid(int userId)
        {
            var user = await _context.Users
                .Where(u => u.Id == userId && u.is_break_glass_account)
                .FirstOrDefaultAsync();

            if (user == null)
                return false;

            // Check if locked
            if (user.is_locked)
            {
                if (user.locked_until.HasValue && user.locked_until > DateTime.UtcNow)
                    return false;
            }

            // Check if password expired
            if (user.password_expires_at.HasValue && user.password_expires_at < DateTime.UtcNow)
                return false;

            // Check if forced password change pending
            if (user.requires_password_change)
                return false;

            return true;
        }

        /// <summary>
        /// FIX #11: Get last break-glass access record
        /// </summary>
        public async Task<BreakGlassAccessLogs> GetLastBreakGlassAccess(int userId)
        {
            return await _context.BreakGlassAccessLogs
                .Where(log => log.user_id == userId)
                .OrderByDescending(log => log.login_time)
                .FirstOrDefaultAsync();
        }

        /// <summary>
        /// FIX #11: Get all break-glass access logs (System Admin audit)
        /// </summary>
        public async Task<List<BreakGlassAccessLogs>> GetAllBreakGlassAccessLogs(int userId)
        {
            return await _context.BreakGlassAccessLogs
                .Where(log => log.user_id == userId)
                .OrderByDescending(log => log.login_time)
                .ToListAsync();
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
