using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ERP.Entities;
using ERP.Services.Auth;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace ERP.API.Controllers
{
    [ApiController]
    [Route("api/maintenance")]
    public class MaintenanceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IFirebaseService _firebaseService;
        private readonly ILogger<MaintenanceController> _logger;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration;

        public MaintenanceController(
            AppDbContext context, 
            IFirebaseService firebaseService,
            ILogger<MaintenanceController> logger,
            Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            _context = context;
            _firebaseService = firebaseService;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpPost("cleanup-employees")]
        [AllowAnonymous] // Allow cleanup without a bearer token if the master key is valid
        public async Task<IActionResult> CleanupEmployees([FromQuery] string masterKey, [FromQuery] string adminEmail = "admin@nexahrm.com")
        {
            // Simple security check using a key from appsettings or a default
            var expectedKey = _configuration["Maintenance:MasterKey"] ?? "NexaHRM_Maintenance_2026";
            if (masterKey != expectedKey)
            {
                _logger.LogWarning("Maintenance: Unauthorized cleanup attempt with key: {Key}", masterKey);
                return Unauthorized("Invalid Maintenance Key.");
            }
            _logger.LogWarning("Maintenance: CleanupEmployees requested for all except {AdminEmail}", adminEmail);

            try
            {
                // 1. Firebase Cleanup
                var fbUsers = await _firebaseService.ListAllUsersAsync();
                int fbDeleted = 0;
                foreach (var fbUser in fbUsers)
                {
                    if (!string.Equals(fbUser.Email, adminEmail, StringComparison.OrdinalIgnoreCase))
                    {
                        await _firebaseService.DeleteUserAsync(fbUser.Uid);
                        fbDeleted++;
                    }
                }
                _logger.LogInformation("Firebase: Deleted {Count} users.", fbDeleted);

                // 2. Database Cleanup
                using var transaction = await _context.Database.BeginTransactionAsync();
                
                // Find Admin IDs
                var adminUser = await _context.Users
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(u => u.username == adminEmail);
                
                int? adminUserId = adminUser?.Id;
                int? adminEmployeeId = adminUser?.employee_id;

                if (adminUserId == null)
                {
                    _logger.LogWarning("Admin user {AdminEmail} not found in database. Proceeding to clear everything.", adminEmail);
                }

                // Delete order to avoid FK issues (Restrict)
                
                // Tables related to Specific Employee Data (Children first)
                await ClearEmployeeRelatedTables(adminEmployeeId);
                
                // Auth & Session tables
                var authSessions = _context.AuthSessions.IgnoreQueryFilters();
                if (adminUserId.HasValue) 
                    _context.AuthSessions.RemoveRange(authSessions.Where(s => s.user_id != adminUserId.Value));
                else 
                    _context.AuthSessions.RemoveRange(authSessions);

                var userRoles = _context.UserRoles.IgnoreQueryFilters();
                if (adminUserId.HasValue) 
                    _context.UserRoles.RemoveRange(userRoles.Where(ur => ur.user_id != adminUserId.Value));
                else 
                    _context.UserRoles.RemoveRange(userRoles);

                await _context.SaveChangesAsync();

                // Users
                var users = _context.Users.IgnoreQueryFilters();
                if (adminUserId.HasValue) 
                    _context.Users.RemoveRange(users.Where(u => u.Id != adminUserId.Value));
                else 
                    _context.Users.RemoveRange(users);
                
                await _context.SaveChangesAsync();

                // Employees
                var employees = _context.Employees.IgnoreQueryFilters();
                if (adminEmployeeId.HasValue) 
                    _context.Employees.RemoveRange(employees.Where(e => e.Id != adminEmployeeId.Value));
                else 
                    _context.Employees.RemoveRange(employees);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { 
                    Message = "Cleanup successful", 
                    FirebaseDeleted = fbDeleted,
                    TotalEmployeesRemaining = await _context.Employees.IgnoreQueryFilters().CountAsync(),
                    TotalUsersRemaining = await _context.Users.IgnoreQueryFilters().CountAsync()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during data cleanup");
                return StatusCode(500, new { Error = ex.Message, Details = ex.InnerException?.Message });
            }
        }

        private async Task ClearEmployeeRelatedTables(int? protectEmployeeId)
        {
            // 1. Requests specialized tables (Delete children first)
            var allRequests = _context.Requests.IgnoreQueryFilters();
            if (protectEmployeeId.HasValue) 
                allRequests = allRequests.Where(r => r.employee_id != protectEmployeeId.Value);
            
            var requestIds = await allRequests.Select(r => r.Id).ToListAsync();

            if (requestIds.Any())
            {
                // Remove specialized request data
                _context.RequestRewards.RemoveRange(_context.RequestRewards.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestSalaryAdvances.RemoveRange(_context.RequestSalaryAdvances.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.LeaveRequests.RemoveRange(_context.LeaveRequests.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestOvertime.RemoveRange(_context.RequestOvertime.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestResignations.RemoveRange(_context.RequestResignations.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestShiftChange.RemoveRange(_context.RequestShiftChange.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestShiftRegister.RemoveRange(_context.RequestShiftRegister.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestShiftSwap.RemoveRange(_context.RequestShiftSwap.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestWorkTrips.RemoveRange(_context.RequestWorkTrips.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestPayments.RemoveRange(_context.RequestPayments.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestExpensePayments.RemoveRange(_context.RequestExpensePayments.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestBorrows.RemoveRange(_context.RequestBorrows.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestDeviceChanges.RemoveRange(_context.RequestDeviceChanges.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                _context.RequestApprovals.RemoveRange(_context.RequestApprovals.IgnoreQueryFilters().Where(r => requestIds.Contains(r.request_id)));
                
                await _context.SaveChangesAsync();
                
                // Now delete the base requests
                _context.Requests.RemoveRange(allRequests);
                await _context.SaveChangesAsync();
            }

            // 2. Attendance & Logs
            var protect = protectEmployeeId;
            _context.AttendanceRecords.RemoveRange(_context.AttendanceRecords.IgnoreQueryFilters().Where(a => !protect.HasValue || a.employee_id != protect.Value));
            _context.AttendanceLogs.RemoveRange(_context.AttendanceLogs.IgnoreQueryFilters().Where(a => !protect.HasValue || a.employee_id != protect.Value));
            _context.DailyAttendance.RemoveRange(_context.DailyAttendance.IgnoreQueryFilters().Where(a => !protect.HasValue || a.employee_id != protect.Value));
            _context.AttendanceModifications.RemoveRange(_context.AttendanceModifications.IgnoreQueryFilters()); // No direct employee_id usually, FK to records
            _context.AttendanceSettings.RemoveRange(_context.AttendanceSettings.IgnoreQueryFilters().Where(a => !protect.HasValue || a.employee_id != protect.Value));

            // 3. Contracts & Salary
            _context.Contracts.RemoveRange(_context.Contracts.IgnoreQueryFilters().Where(c => !protect.HasValue || c.employee_id != protect.Value));
            _context.Salaries.RemoveRange(_context.Salaries.IgnoreQueryFilters().Where(s => !protect.HasValue || s.employee_id != protect.Value));
            _context.BankAccounts.RemoveRange(_context.BankAccounts.IgnoreQueryFilters().Where(b => !protect.HasValue || b.employee_id != protect.Value));
            _context.PayrollDetails.RemoveRange(_context.PayrollDetails.IgnoreQueryFilters()); // Usually linked to employees
            _context.Deductions.RemoveRange(_context.Deductions.IgnoreQueryFilters());

            // 4. Personal Info & Docs
            _context.EmployeeAddresses.RemoveRange(_context.EmployeeAddresses.IgnoreQueryFilters().Where(e => !protect.HasValue || e.employee_id != protect.Value));
            _context.EmployeeDocuments.RemoveRange(_context.EmployeeDocuments.IgnoreQueryFilters().Where(e => !protect.HasValue || e.EmployeeId != protect.Value));
            _context.EmployeeSkills.RemoveRange(_context.EmployeeSkills.IgnoreQueryFilters().Where(e => !protect.HasValue || e.employee_id != protect.Value));
            _context.EmployeeCertificates.RemoveRange(_context.EmployeeCertificates.IgnoreQueryFilters().Where(e => !protect.HasValue || e.employee_id != protect.Value));
            _context.EmployeeCourses.RemoveRange(_context.EmployeeCourses.IgnoreQueryFilters().Where(e => !protect.HasValue || e.employee_id != protect.Value));
            _context.EmployeeEvaluations.RemoveRange(_context.EmployeeEvaluations.IgnoreQueryFilters().Where(e => !protect.HasValue || e.employee_id != protect.Value));
            _context.EmployeeLeaves.RemoveRange(_context.EmployeeLeaves.IgnoreQueryFilters().Where(e => !protect.HasValue || e.employee_id != protect.Value));
            _context.WorkHistory.RemoveRange(_context.WorkHistory.IgnoreQueryFilters().Where(w => !protect.HasValue || w.employee_id != protect.Value));
            _context.PromotionHistory.RemoveRange(_context.PromotionHistory.IgnoreQueryFilters().Where(p => !protect.HasValue || p.employee_id != protect.Value));
            _context.Education.RemoveRange(_context.Education.IgnoreQueryFilters().Where(e => !protect.HasValue || e.employee_id != protect.Value));
            _context.EmergencyContacts.RemoveRange(_context.EmergencyContacts.IgnoreQueryFilters().Where(e => !protect.HasValue || e.employee_id != protect.Value));
            _context.Dependents.RemoveRange(_context.Dependents.IgnoreQueryFilters().Where(d => !protect.HasValue || d.employee_id != protect.Value));
            _context.HealthRecords.RemoveRange(_context.HealthRecords.IgnoreQueryFilters().Where(h => !protect.HasValue || h.employee_id != protect.Value));
            _context.Insurances.RemoveRange(_context.Insurances.IgnoreQueryFilters().Where(i => !protect.HasValue || i.employee_id != protect.Value));
            _context.AssetAllocations.RemoveRange(_context.AssetAllocations.IgnoreQueryFilters().Where(a => !protect.HasValue || a.employee_id != protect.Value));

            await _context.SaveChangesAsync();
        }
    }
}
