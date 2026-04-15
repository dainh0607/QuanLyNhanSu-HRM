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
    /// FIX #12: Login attempt tracking and account lockout
    /// Prevents brute force attacks by locking accounts after repeated failed attempts
    /// </summary>
    public interface ILoginAttemptService
    {
        Task<LoginAttempts> RecordFailedAttempt(int userId, string username, string ipAddress, 
            string userAgent, string reason);
        
        Task<LoginAttempts> RecordSuccessfulAttempt(int userId, string username, string ipAddress, string userAgent);
        
        Task<bool> IsTooManyFailedAttempts(int userId);
        
        Task<bool> IsAccountLockedOut(int userId);
        
        Task LockAccountTemporarily(int userId, int minutesToLock = 15);
        
        Task UnlockAccount(int userId);
        
        Task ResetFailedAttempts(int userId);
        
        Task<int> GetFailedAttemptCount(int userId, int withinMinutes = 15);
        
        Task<List<LoginAttempts>> GetRecentAttempts(int userId, int minutesToCheck = 60);
    }

    public class LoginAttemptService : ILoginAttemptService
    {
        private readonly AppDbContext _context;
        private readonly IUnitOfWork _unitOfWork;

        // Configuration
        private const int MAX_FAILED_ATTEMPTS = 5;
        private const int LOCKOUT_MINUTES = 15;
        private const int CHECK_WINDOW_MINUTES = 15;

        public LoginAttemptService(AppDbContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// FIX #12: Record failed login attempt and check for lockout
        /// </summary>
        public async Task<LoginAttempts> RecordFailedAttempt(int userId, string username, 
            string ipAddress, string userAgent, string reason)
        {
            // Get current failed attempt count
            var recentFailures = await GetFailedAttemptCount(userId, CHECK_WINDOW_MINUTES);

            var attempt = new LoginAttempts
            {
                user_id = userId,
                username_attempted = username,
                ip_address = ipAddress,
                user_agent = userAgent,
                is_success = false,
                reason_for_failure = reason,
                failed_attempt_count = recentFailures + 1,
                attempt_time = DateTime.UtcNow
            };

            // Check if this attempt triggers lockout
            if (recentFailures + 1 >= MAX_FAILED_ATTEMPTS)
            {
                attempt.triggered_account_lockout = true;
                attempt.locked_until = DateTime.UtcNow.AddMinutes(LOCKOUT_MINUTES);

                // Lock the account
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.is_locked = true;
                    user.locked_until = attempt.locked_until;
                    user.failed_login_count = recentFailures + 1;
                    user.last_failed_login_time = DateTime.UtcNow;
                    _context.Users.Update(user);
                }
            }

            _context.LoginAttempts.Add(attempt);
            await _context.SaveChangesAsync();

            return attempt;
        }

        /// <summary>
        /// FIX #12: Record successful login and clear failed attempts
        /// </summary>
        public async Task<LoginAttempts> RecordSuccessfulAttempt(int userId, string username, 
            string ipAddress, string userAgent)
        {
            var attempt = new LoginAttempts
            {
                user_id = userId,
                username_attempted = username,
                ip_address = ipAddress,
                user_agent = userAgent,
                is_success = true,
                attempt_time = DateTime.UtcNow
            };

            _context.LoginAttempts.Add(attempt);

            // Reset failed attempts counter
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.failed_login_count = 0;
                user.is_locked = false;
                user.locked_until = null;
                _context.Users.Update(user);
            }

            await _context.SaveChangesAsync();

            return attempt;
        }

        /// <summary>
        /// FIX #12: Check if account has too many failed attempts
        /// </summary>
        public async Task<bool> IsTooManyFailedAttempts(int userId)
        {
            var failedCount = await GetFailedAttemptCount(userId, CHECK_WINDOW_MINUTES);
            return failedCount >= MAX_FAILED_ATTEMPTS;
        }

        /// <summary>
        /// FIX #12: Check if account is currently locked out
        /// </summary>
        public async Task<bool> IsAccountLockedOut(int userId)
        {
            var user = await _context.Users
                .Where(u => u.Id == userId)
                .FirstOrDefaultAsync();

            if (user == null)
                return false;

            if (!user.is_locked)
                return false;

            // Check if lock has expired
            if (user.locked_until.HasValue && user.locked_until <= DateTime.UtcNow)
            {
                // Auto unlock if time passed
                user.is_locked = false;
                user.locked_until = null;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                return false;
            }

            return true;
        }

        /// <summary>
        /// FIX #12: Manually lock account for specified duration
        /// </summary>
        public async Task LockAccountTemporarily(int userId, int minutesToLock = 15)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.is_locked = true;
                user.locked_until = DateTime.UtcNow.AddMinutes(minutesToLock);
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// FIX #12: Unlock account (System Admin only)
        /// </summary>
        public async Task UnlockAccount(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.is_locked = false;
                user.locked_until = null;
                user.failed_login_count = 0;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// FIX #12: Reset failed attempts counter (after successful login or by admin)
        /// </summary>
        public async Task ResetFailedAttempts(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.failed_login_count = 0;
                user.last_failed_login_time = null;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// FIX #12: Get count of failed attempts within a time window
        /// </summary>
        public async Task<int> GetFailedAttemptCount(int userId, int withinMinutes = 15)
        {
            var cutoffTime = DateTime.UtcNow.AddMinutes(-withinMinutes);

            return await _context.LoginAttempts
                .Where(la => la.user_id == userId && 
                       !la.is_success &&
                       la.attempt_time > cutoffTime)
                .CountAsync();
        }

        /// <summary>
        /// FIX #12: Get recent login attempts for audit
        /// </summary>
        public async Task<List<LoginAttempts>> GetRecentAttempts(int userId, int minutesToCheck = 60)
        {
            var cutoffTime = DateTime.UtcNow.AddMinutes(-minutesToCheck);

            return await _context.LoginAttempts
                .Where(la => la.user_id == userId && la.attempt_time > cutoffTime)
                .OrderByDescending(la => la.attempt_time)
                .ToListAsync();
        }
    }
}
