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

        [HttpPost("sync-firebase")]
        [AllowAnonymous]
        public async Task<IActionResult> SyncFirebaseAccounts([FromQuery] string masterKey, [FromQuery] int? targetTenantId = null)
        {
            var expectedKey = _configuration["Maintenance:MasterKey"] ?? "NexaHRM_Maintenance_2026";
            if (masterKey != expectedKey)
            {
                return Unauthorized("Invalid Maintenance Key.");
            }

            try
            {
                var empQuery = _context.Employees.IgnoreQueryFilters();
                if (targetTenantId.HasValue) empQuery = empQuery.Where(e => e.tenant_id == targetTenantId.Value);
                var employees = await empQuery.ToListAsync();

                var usrQuery = _context.Users.IgnoreQueryFilters();
                if (targetTenantId.HasValue) usrQuery = usrQuery.Where(u => u.tenant_id == targetTenantId.Value);
                var users = await usrQuery.ToListAsync();
                
                int createdCount = 0;
                int deletedCount = 0;
                int disabledCount = 0;
                var errors = new List<string>();

                foreach (var emp in employees)
                {
                    var user = users.FirstOrDefault(u => u.employee_id == emp.Id);

                    if (emp.is_active)
                    {
                        // Requirement: tenant_id must exist
                        if (!emp.tenant_id.HasValue)
                        {
                            emp.is_active = false;
                            disabledCount++;
                            _logger.LogWarning("Employee {Code} has no tenant_id. Disabled.", emp.employee_code);
                            continue;
                        }

                        // Check if needs Firebase activation
                        if (user == null || string.IsNullOrWhiteSpace(user.firebase_uid))
                        {
                            try
                            {
                                string email = !string.IsNullOrWhiteSpace(emp.email) 
                                    ? emp.email 
                                    : $"{emp.employee_code.ToLower()}@nexahrm.local";

                                string? normalizedPhone = null;
                                if (!string.IsNullOrWhiteSpace(emp.phone))
                                {
                                    normalizedPhone = emp.phone.Trim();
                                    if (normalizedPhone.StartsWith("0"))
                                    {
                                        normalizedPhone = "+84" + normalizedPhone.Substring(1);
                                    }
                                    
                                    if (!normalizedPhone.StartsWith("+"))
                                    {
                                        normalizedPhone = null; // Firebase requires E.164
                                    }
                                }

                                var fbUserArgs = new FirebaseAdmin.Auth.UserRecordArgs
                                {
                                    Email = email,
                                    Password = "123456789", // Default as requested
                                    DisplayName = emp.full_name,
                                    PhoneNumber = normalizedPhone,
                                    Disabled = false
                                };

                                var fbUser = await _firebaseService.CreateUserAsync(fbUserArgs);
                                
                                if (user == null)
                                {
                                    user = new ERP.Entities.Models.Users
                                    {
                                        employee_id = emp.Id,
                                        username = email,
                                        firebase_uid = fbUser.Uid,
                                        tenant_id = emp.tenant_id,
                                        is_active = true,
                                        CreatedAt = DateTime.UtcNow,
                                        UpdatedAt = DateTime.UtcNow
                                    };
                                    _context.Users.Add(user);
                                }
                                else
                                {
                                    user.firebase_uid = fbUser.Uid;
                                    user.is_active = true;
                                    user.UpdatedAt = DateTime.UtcNow;
                                }

                                await _context.SaveChangesAsync();

                                // Assign default role (Staff = 7)
                                if (!await _context.UserRoles.IgnoreQueryFilters().AnyAsync(ur => ur.user_id == user.Id))
                                {
                                    _context.UserRoles.Add(new ERP.Entities.Models.UserRoles
                                    {
                                        user_id = user.Id,
                                        role_id = 7, // Staff
                                        tenant_id = emp.tenant_id,
                                        CreatedAt = DateTime.UtcNow,
                                        UpdatedAt = DateTime.UtcNow
                                    });
                                    await _context.SaveChangesAsync();
                                }

                                createdCount++;
                            }
                            catch (Exception ex)
                            {
                                errors.Add($"Error creating user for {emp.employee_code}: {ex.Message}");
                            }
                        }
                    }
                    else
                    {
                        // Requirement: Inactive employees should be deleted from Firebase
                        if (user != null && !string.IsNullOrWhiteSpace(user.firebase_uid))
                        {
                            try
                            {
                                await _firebaseService.DeleteUserAsync(user.firebase_uid);
                                user.firebase_uid = ""; // Clear UID
                                user.is_active = false;
                                user.UpdatedAt = DateTime.UtcNow;
                                await _context.SaveChangesAsync();
                                deletedCount++;
                            }
                            catch (Exception ex)
                            {
                                // If user not found in Firebase, just clear locally
                                if (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                                {
                                    user.firebase_uid = "";
                                    await _context.SaveChangesAsync();
                                }
                                else
                                {
                                    errors.Add($"Error deleting user for {emp.employee_code}: {ex.Message}");
                                }
                            }
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Sync completed",
                    Created = createdCount,
                    DeletedFromFirebase = deletedCount,
                    DisabledDueToNoTenant = disabledCount,
                    Errors = errors
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sync error");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        [HttpGet("sync-report")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSyncReport([FromQuery] string masterKey, [FromQuery] int? targetTenantId = null)
        {
            var expectedKey = _configuration["Maintenance:MasterKey"] ?? "NexaHRM_Maintenance_2026";
            if (masterKey != expectedKey)
            {
                return Unauthorized("Invalid Maintenance Key.");
            }

            try
            {
                // 1. Fetch data from SQL
                var empQuery = _context.Employees.IgnoreQueryFilters();
                if (targetTenantId.HasValue) empQuery = empQuery.Where(e => e.tenant_id == targetTenantId.Value);
                var sqlEmployees = await empQuery.ToListAsync();
                var employees = sqlEmployees;

                var usrQuery = _context.Users.IgnoreQueryFilters();
                if (targetTenantId.HasValue) usrQuery = usrQuery.Where(u => u.tenant_id == targetTenantId.Value);
                var sqlUsers = await usrQuery.ToListAsync();
                var users = sqlUsers;

                // 2. Fetch data from Firebase
                var fbUsers = await _firebaseService.ListAllUsersAsync();
                var fbUserDict = fbUsers.ToDictionary(u => u.Uid, u => u);
                var fbEmailDict = fbUsers.ToDictionary(u => u.Email?.ToLower() ?? u.Uid, u => u);

                // 3. Cross-reference
                var matched = new List<object>();
                var sqlOnly = new List<object>();
                var fbOnly = new List<object>();
                var brokenLinks = new List<object>();

                foreach (var emp in employees)
                {
                    var user = users.FirstOrDefault(u => u.employee_id == emp.Id);
                    
                    if (user == null)
                    {
                        sqlOnly.Add(new { emp.Id, emp.employee_code, emp.full_name, emp.email, Reason = "No User record" });
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(user.firebase_uid))
                    {
                        sqlOnly.Add(new { emp.Id, emp.employee_code, emp.full_name, user.username, Reason = "No Firebase UID linked" });
                    }
                    else if (fbUserDict.ContainsKey(user.firebase_uid))
                    {
                        var fb = fbUserDict[user.firebase_uid];
                        matched.Add(new { emp.Id, emp.employee_code, emp.full_name, user.username, fb.Uid, fb.Email });
                        fbUserDict.Remove(user.firebase_uid); // Remove so we can find orphans later
                    }
                    else
                    {
                        brokenLinks.Add(new { emp.Id, emp.employee_code, emp.full_name, user.username, MissingUid = user.firebase_uid });
                    }
                }

                // Remaining in fbUserDict are orphans
                foreach (var orphan in fbUserDict.Values)
                {
                    fbOnly.Add(new { orphan.Uid, orphan.Email, orphan.DisplayName });
                }

                return Ok(new
                {
                    Summary = new
                    {
                        TotalEmployeesSql = employees.Count,
                        TotalUsersSql = users.Count,
                        TotalFirebaseUsers = fbUsers.Count(),
                        Matched = matched.Count,
                        SqlOnly = sqlOnly.Count,
                        FirebaseOnlyOrphans = fbOnly.Count,
                        BrokenLinks = brokenLinks.Count
                    },
                    Details = new
                    {
                        Matches = matched.Take(100), // Limit for safety
                        SqlOnlyEmployees = sqlOnly.Take(100),
                        FirebaseOrphans = fbOnly.Take(100),
                        BrokenLinks = brokenLinks
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sync report error");
                return StatusCode(500, new { Error = ex.Message });
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
