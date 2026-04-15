using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Models;
using FirebaseAdmin.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using EmployeeEntity = ERP.Entities.Models.Employees;

namespace ERP.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AuthService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IFirebaseService _firebaseService;
        private readonly IUserService _userService;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthService(
            AppDbContext context,
            ILogger<AuthService> logger,
            IConfiguration configuration,
            IFirebaseService firebaseService,
            IUserService userService,
            IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _firebaseService = firebaseService;
            _userService = userService;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<AuthResponseDto> SignUpAsync(SignUpDto dto)
        {
            IDbContextTransaction? transaction = null;

            try
            {
                dto.Email = dto.Email?.Trim();
                dto.FullName = dto.FullName?.Trim();
                dto.EmployeeCode = dto.EmployeeCode?.Trim();
                dto.PhoneNumber = dto.PhoneNumber?.Trim();

                if (IsMasterEmail(dto.Email))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Tai khoan SuperAdmin goc duoc quan ly rieng tren Firebase, khong duoc dang ky qua public sign-up."
                    };
                }

                transaction = await _context.Database.BeginTransactionAsync();
                InvitationTokens invitation = null;
                if (!string.IsNullOrEmpty(dto.InvitationToken))
                {
                    invitation = await _context.InvitationTokens
                        .FirstOrDefaultAsync(i => i.Token == dto.InvitationToken && !i.IsUsed && i.ExpiresAt > DateTime.UtcNow);
                    
                    if (invitation == null)
                    {
                        return new AuthResponseDto { Success = false, Message = "Mã mời không hợp lệ hoặc đã hết hạn." };
                    }

                    if (!string.Equals(invitation.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
                    {
                        return new AuthResponseDto { Success = false, Message = "Email không khớp với mã mời." };
                    }
                }
                var existingEmployee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.email == dto.Email);

                if (existingEmployee != null)
                {
                    var existingUser = await _context.Users
                        .FirstOrDefaultAsync(u => u.employee_id == existingEmployee.Id);

                    if (existingUser != null)
                    {
                        return new AuthResponseDto
                        {
                            Success = false,
                            Message = "Email da duoc dang ky"
                        };
                    }
                }

                FirebaseUserDto firebaseUser;
                var userArgs = new UserRecordArgs
                {
                    Email = dto.Email,
                    Password = dto.Password,
                    DisplayName = dto.FullName,
                    PhoneNumber = dto.PhoneNumber,
                    Disabled = false
                };

                try
                {
                    firebaseUser = await _firebaseService.CreateUserAsync(userArgs);
                }
                catch (Exception fbEx)
                {
                    if (transaction != null)
                    {
                        await transaction.RollbackAsync();
                    }
                    _logger.LogError(fbEx, "Firebase error during sign up");
                    return new AuthResponseDto { Success = false, Message = $"Lỗi Firebase: {fbEx.Message}" };
                }

                // Create/Update Local Employee & Handle Multi-tenancy
                Tenants? workspace = null;
                int? tenantId = null;

                if (invitation != null)
                {
                    // Case 1: Joining an existing workspace via invitation
                    // In a production system, invitation should carry tenant_id. 
                    // For now, we find the creator's tenant.
                    var creator = await _context.Users.FindAsync(invitation.CreatedBy);
                    tenantId = creator?.tenant_id;
                }
                else
                {
                    // Case 2: Creating a new workspace (New Customer)
                    if (string.IsNullOrWhiteSpace(dto.CompanyName))
                    {
                        return new AuthResponseDto { Success = false, Message = "Tên công ty là bắt buộc khi đăng ký không gian làm việc mới." };
                    }

                    workspace = new Tenants
                    {
                        name = dto.CompanyName,
                        code = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper(), // Simple auto-code
                        is_active = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Tenants.Add(workspace);
                    await _context.SaveChangesAsync();
                    tenantId = workspace.Id;
                }

                try
                {
                    // Create/Update Local Employee
                    if (existingEmployee == null)
                    {
                        existingEmployee = new ERP.Entities.Models.Employees
                        {
                            employee_code = dto.EmployeeCode,
                            full_name = dto.FullName,
                            email = dto.Email,
                            phone = dto.PhoneNumber,
                            tenant_id = tenantId,
                            is_active = true,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.Employees.Add(existingEmployee);
                        await _context.SaveChangesAsync();
                    }

                    // Create Local User
                    var user = await _userService.CreateLocalUserAsync(existingEmployee.Id, dto.Email, firebaseUser.Uid, tenantId);

                    // Assign Roles
                    int assignedRoleId = invitation != null ? 7 : 1; // Default to Staff for invited, Tenant Admin (1) for Workspace Owner
                    
                    // Master Email check (Override to Super Admin)
                    string masterEmail = _configuration["AdminSettings:MasterEmail"];
                    if (!string.IsNullOrEmpty(masterEmail) &&
                        string.Equals(dto.Email, masterEmail, StringComparison.OrdinalIgnoreCase))
                    {
                        assignedRoleId = 1; // Or a specific Super Admin role if defined differently
                    }

                    await _userService.AssignRoleAsync(user.Id, assignedRoleId, tenantId, workspace != null ? "Workspace Owner (Initial)" : "Staff Join");

                    // Mark invitation as used
                    if (invitation != null)
                    {
                        invitation.IsUsed = true;
                        invitation.UsedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();

                    return new AuthResponseDto
                    {
                        Success = true,
                        Message = workspace != null ? $"Đăng ký thành công. Đã khởi tạo Workspace: {workspace.name}" : "Đăng ký thành công và tham gia Workspace thành công.",
                        User = await _userService.GetByIdAsync(user.Id)
                    };
                }
                catch (Exception)
                {
                    if (transaction != null)
                    {
                        await transaction.RollbackAsync();
                    }
                    try
                    {
                        if (firebaseUser != null && !string.IsNullOrEmpty(firebaseUser.Uid))
                        {
                            await _firebaseService.DeleteUserAsync(firebaseUser.Uid);
                        }
                    }
                    catch (Exception fbEx)
                    {
                        _logger.LogError($"Failed to rollback Firebase user {firebaseUser?.Uid}: {fbEx.Message}");
                    }
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SignUpAsync");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Loi xay ra trong qua trinh dang ky"
                };
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto, AuthSessionContextDto sessionContext)
        {
            try
            {
                var normalizedEmail = dto.Email?.Trim();
                var firebaseResult = await _firebaseService.SignInWithPasswordAsync(normalizedEmail ?? string.Empty, dto.Password);
                if (!firebaseResult.Success)
                {
                    return new AuthResponseDto { Success = false, Message = firebaseResult.Message ?? "Dang nhap that bai" };
                }

                var allowAutoProvisionEmployee =
                    !string.IsNullOrWhiteSpace(firebaseResult.LocalId) &&
                    !firebaseResult.LocalId.StartsWith("bypass:", StringComparison.OrdinalIgnoreCase);

                var localUser = await EnsureLocalUserForLoginAsync(
                    firebaseResult.LocalId,
                    firebaseResult.Email ?? normalizedEmail,
                    allowAutoProvisionEmployee
                );
                if (localUser == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Tai khoan chua duoc dong bo vao he thong. Vui long lien he quan tri vien."
                    };
                }

                var userInfo = await BuildUserInfoAsync(localUser);
                if (userInfo == null)
                {
                    return new AuthResponseDto { Success = false, Message = "Khong the tai thong tin nguoi dung" };
                }

                // Chặn nhân viên không có quyền quản lý đăng nhập vào hệ thống quản trị
                var allowedManagementRoles = new[] { "Admin", "Manager", "Regional Manager", "Branch Manager", "Department Head", "Module Admin" };
                if (userInfo.Roles == null || !userInfo.Roles.Any(r => allowedManagementRoles.Contains(r)))
                {
                    return new AuthResponseDto 
                    { 
                        Success = false, 
                        Message = "Your account does not have permission to access the management system." 
                    };
                }

                return await CreateSessionResponseAsync(localUser.Id, userInfo, sessionContext, "Dang nhap thanh cong");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in LoginAsync");
                return new AuthResponseDto { Success = false, Message = "Loi xay ra trong qua trinh dang nhap" };
            }
        }

        public async Task<AuthResponseDto> RefreshSessionAsync(string refreshToken, AuthSessionContextDto sessionContext)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(refreshToken))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Thieu refresh token"
                    };
                }

                var tokenHash = AuthTokenSecurity.ComputeHash(refreshToken);
                var existingSession = await _context.AuthSessions
                    .FirstOrDefaultAsync(session => session.refresh_token_hash == tokenHash);

                if (existingSession == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Refresh token khong hop le"
                    };
                }

                var utcNow = DateTime.UtcNow;

                if (existingSession.revoked_at.HasValue || !existingSession.is_active)
                {
                    await RevokeAllActiveSessionsAsync(existingSession.user_id, utcNow, "Phat hien refresh token bi reuse.");
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Refresh token da bi thu hoi"
                    };
                }

                if (existingSession.expires_at <= utcNow)
                {
                    MarkSessionRevoked(existingSession, utcNow, "Refresh token het han.");
                    await _context.SaveChangesAsync();
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Refresh token da het han"
                    };
                }

                var userInfo = await GetUserByIdAsync(existingSession.user_id);
                if (userInfo == null || !userInfo.IsActive)
                {
                    MarkSessionRevoked(existingSession, utcNow, "Nguoi dung khong con hieu luc.");
                    await _context.SaveChangesAsync();
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Nguoi dung khong con hieu luc"
                    };
                }

                var newSessionId = Guid.NewGuid().ToString("N");
                var newRefreshToken = AuthTokenSecurity.GenerateOpaqueToken();
                var newCsrfToken = AuthTokenSecurity.GenerateOpaqueToken(32);

                MarkSessionRevoked(existingSession, utcNow, "Refresh token da duoc xoay vong.", newSessionId);
                var replacementSession = BuildSession(existingSession.user_id, newSessionId, newRefreshToken, newCsrfToken, sessionContext, utcNow);
                replacementSession.last_used_at = utcNow;

                _context.AuthSessions.Add(replacementSession);
                await _context.SaveChangesAsync();

                return BuildAuthResponse(userInfo, newSessionId, newRefreshToken, newCsrfToken, "Lam moi phien thanh cong");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RefreshSessionAsync");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Khong the lam moi phien dang nhap"
                };
            }
        }

        public async Task RevokeSessionAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return;
            }

            var tokenHash = AuthTokenSecurity.ComputeHash(refreshToken);
            var authSession = await _context.AuthSessions
                .FirstOrDefaultAsync(session => session.refresh_token_hash == tokenHash);

            if (authSession == null || authSession.revoked_at.HasValue)
            {
                return;
            }

            MarkSessionRevoked(authSession, DateTime.UtcNow, "Nguoi dung dang xuat.");
            await _context.SaveChangesAsync();
        }

        public async Task<UserInfoDto?> GetUserByUidAsync(string uid)
        {
            try
            {
                var localUser = await _context.Users
                    .Include(u => u.Employee)
                    .FirstOrDefaultAsync(u => u.firebase_uid == uid && u.is_active);

                var userInfo = await BuildUserInfoAsync(localUser);
                if (userInfo == null)
                {
                    return null;
                }

                try
                {
                    if (FirebaseAdmin.FirebaseApp.DefaultInstance != null || _configuration.GetValue<bool>("Firebase:BypassAuth"))
                    {
                        var firebaseUser = await _firebaseService.GetUserAsync(uid);

                        if (firebaseUser != null)
                        {
                            if (!string.IsNullOrWhiteSpace(firebaseUser.Email))
                            {
                                userInfo.Email = firebaseUser.Email;
                            }

                            if (!string.IsNullOrWhiteSpace(firebaseUser.DisplayName))
                            {
                                userInfo.FullName = firebaseUser.DisplayName;
                            }

                            if (!string.IsNullOrWhiteSpace(firebaseUser.PhoneNumber))
                            {
                                userInfo.PhoneNumber = firebaseUser.PhoneNumber;
                            }

                            userInfo.PhotoUrl = firebaseUser.PhotoUrl;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not enrich user info from Firebase for uid {Uid}", uid);
                }

                return userInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUserByUidAsync");
                return null;
            }
        }

        public async Task<UserInfoDto?> GetUserByIdAsync(int userId)
        {
            try
            {
                var localUser = await _context.Users
                    .Include(u => u.Employee)
                    .FirstOrDefaultAsync(u => u.Id == userId && u.is_active);

                return await BuildUserInfoAsync(localUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUserByIdAsync");
                return null;
            }
        }

        public async Task<string?> VerifyTokenAsync(string idToken)
        {
            if (FirebaseAdmin.FirebaseApp.DefaultInstance == null)
            {
                _logger.LogWarning("Firebase App not initialized. Skipping VerifyTokenAsync.");
                return null;
            }

            try
            {
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                return decodedToken.Uid;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying Firebase token");
                return null;
            }
        }

        public async Task<int> SyncFirebaseUsersAsync()
        {
            if (FirebaseAdmin.FirebaseApp.DefaultInstance == null)
            {
                _logger.LogWarning("Firebase App not initialized. Skipping SyncFirebaseUsersAsync.");
                return 0;
            }

            var syncCount = 0;

            try
            {
                _logger.LogInformation("Starting Firebase to Local DB synchronization...");

                var fbUsers = await _firebaseService.ListAllUsersAsync();
                foreach (var fbUser in fbUsers)
                {
                    var localUser = await _context.Users
                        .Include(u => u.Employee)
                        .FirstOrDefaultAsync(u => u.firebase_uid == fbUser.Uid || u.Employee.email == fbUser.Email);

                    var targetRoleId = 2; // Default Manager (Changed from 3)
                    if (fbUser.Email?.ToLower().Contains("admin") == true)
                    {
                        targetRoleId = 1;
                    }

                    if (localUser == null)
                    {
                        _logger.LogInformation("Syncing new user: {Email} ({Uid}) - Role ID: {RoleId}", fbUser.Email, fbUser.Uid, targetRoleId);

                        using var transaction = await _context.Database.BeginTransactionAsync();

                        try
                        {
                            var generatedCode = fbUser.Email?.Split('@')[0].ToUpperInvariant() ?? $"EMP_{Guid.NewGuid():N}"[..8];
                            var employeeCode = generatedCode.Length > 20 ? generatedCode[..20] : generatedCode;

                            var newEmployee = new EmployeeEntity
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
                                username = BuildInternalUsername(newEmployee.employee_code, newEmployee.Id),
                                firebase_uid = fbUser.Uid,
                                is_active = true,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };

                            _context.Users.Add(newUser);
                            await _context.SaveChangesAsync();

                            var userRole = new UserRoles
                            {
                                user_id = newUser.Id,
                                role_id = targetRoleId,
                                is_active = true,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };

                            _context.UserRoles.Add(userRole);
                            await _context.SaveChangesAsync();

                            await transaction.CommitAsync();
                            syncCount++;
                        }
                        catch (Exception ex)
                        {
                            await transaction.RollbackAsync();
                            _logger.LogError(ex, "Failed to sync user {Email}", fbUser.Email);
                        }
                    }
                    else
                    {
                        var desiredUsername = BuildInternalUsername(localUser.Employee?.employee_code, localUser.Employee?.Id ?? localUser.Id);
                        var shouldSaveLocalUser = false;

                        if (!string.Equals(localUser.username, desiredUsername, StringComparison.Ordinal))
                        {
                            localUser.username = desiredUsername;
                            shouldSaveLocalUser = true;
                        }

                        if (!string.Equals(localUser.firebase_uid, fbUser.Uid, StringComparison.Ordinal))
                        {
                            localUser.firebase_uid = fbUser.Uid;
                            shouldSaveLocalUser = true;
                        }

                        if (shouldSaveLocalUser)
                        {
                            localUser.UpdatedAt = DateTime.UtcNow;
                            await _context.SaveChangesAsync();
                        }

                        var currentRoles = await _context.UserRoles
                            .Where(ur => ur.user_id == localUser.Id && ur.is_active)
                            .Select(ur => ur.role_id)
                            .ToListAsync();

                        if (!currentRoles.Contains(targetRoleId))
                        {
                            _logger.LogInformation("Updating roles for existing user: {Email} to include Role ID {RoleId}", fbUser.Email, targetRoleId);

                            var newUserRole = new UserRoles
                            {
                                user_id = localUser.Id,
                                role_id = targetRoleId,
                                is_active = true,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };

                            _context.UserRoles.Add(newUserRole);
                            await _context.SaveChangesAsync();
                            syncCount++;
                        }
                    }
                }

                _logger.LogInformation("Sync completed. {Count} users processed or updated.", syncCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during SyncFirebaseUsersAsync");
            }

            return syncCount;
        }

        public async Task<AuthResponseDto> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            try
            {
                var localUser = await _context.Users
                    .Include(u => u.Employee)
                    .FirstOrDefaultAsync(u => u.Id == userId && u.is_active);

                if (localUser == null)
                {
                    return new AuthResponseDto { Success = false, Message = "Người dùng không tồn tại hoặc đã bị khóa." };
                }

                if (string.IsNullOrEmpty(localUser.Employee?.email))
                {
                    return new AuthResponseDto { Success = false, Message = "Email không hợp lệ. Vui lòng liên hệ quản trị viên." };
                }

                // 1. Verify old password
                var verifyResult = await _firebaseService.SignInWithPasswordAsync(localUser.Employee.email, dto.OldPassword);
                if (!verifyResult.Success)
                {
                    return new AuthResponseDto { Success = false, Message = "Mật khẩu cũ không đúng." };
                }

                // 2. Update to new password in Firebase
                await _firebaseService.UpdateUserPasswordAsync(localUser.firebase_uid, dto.NewPassword);

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Đổi mật khẩu thành công."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ChangePasswordAsync for userId {UserId}", userId);
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Lỗi xảy ra trong quá trình đổi mật khẩu."
                };
            }
        }

        public async Task<AuthResponseDto> PreRegisterStaffAsync(PreRegisterStaffDto dto)
        {
            try
            {
                var existingEmployee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.email == dto.Email);

                if (existingEmployee != null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Email nay da ton tai trong he thong nhan vien."
                    };
                }

                var employee = new EmployeeEntity
                {
                    employee_code = dto.EmployeeCode ?? $"STAFF_{Guid.NewGuid():N}"[..8],
                    full_name = dto.FullName,
                    email = dto.Email,
                    is_active = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Da cap quyen cho email nay voi vai tro nhan vien."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in PreRegisterStaffAsync");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Loi xay ra trong qua trinh cung cap email cho nhan vien."
                };
            }
        }

        private async Task<string> CreateFirebaseUserInternalAsync(string email, string password, string displayName)
        {
            var userArgs = new UserRecordArgs
            {
                Email = email,
                Password = password,
                DisplayName = displayName,
                Disabled = false
            };

            var firebaseUser = await _firebaseService.CreateUserAsync(userArgs);
            return firebaseUser.Uid;
        }

        public async Task<string> CreateFirebaseUserAsync(string email, string password, string displayName, int employeeId)
        {
            var firebaseUid = await CreateFirebaseUserInternalAsync(email, password, displayName);

            var employeeCode = await _context.Employees
                .Where(employee => employee.Id == employeeId)
                .Select(employee => employee.employee_code)
                .FirstOrDefaultAsync();

            var user = new Users
            {
                employee_id = employeeId,
                username = BuildInternalUsername(employeeCode, employeeId),
                firebase_uid = firebaseUid,
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userRole = new UserRoles
            {
                user_id = user.Id,
                role_id = 2, // Default Manager (Changed from 3)
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return firebaseUid;
        }

        public string GenerateInternalToken(UserInfoDto user, string sessionId)
        {
            var claims = CreateBaseClaims(user, sessionId);

            foreach (var role in user.Roles ?? new List<string>())
                claims.Add(new Claim(ClaimTypes.Role, role));

            var credentials = new SigningCredentials(GetJwtSigningKey(), SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(GetAccessTokenExpiryInMinutes()),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<Users?> EnsureLocalUserForLoginAsync(string? firebaseUid, string? email, bool allowAutoProvisionEmployee)
        {
            var normalizedEmail = email?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedEmail))
            {
                return null;
            }

            var normalizedEmailLower = normalizedEmail.ToLower();
            var localUser = await _context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u =>
                    u.is_active &&
                    (
                        (!string.IsNullOrWhiteSpace(firebaseUid) && u.firebase_uid == firebaseUid) ||
                        (!string.IsNullOrWhiteSpace(u.username) && u.username.ToLower() == normalizedEmailLower) ||
                        (u.Employee != null &&
                            (
                                (!string.IsNullOrWhiteSpace(u.Employee.email) && u.Employee.email.ToLower() == normalizedEmailLower) ||
                                (!string.IsNullOrWhiteSpace(u.Employee.work_email) && u.Employee.work_email.ToLower() == normalizedEmailLower)
                            ))
                    ));

            if (localUser == null)
            {
                var employee = await EnsureEmployeeForLoginAsync(normalizedEmail, allowAutoProvisionEmployee);
                if (employee == null)
                {
                    return null;
                }

                localUser = new Users
                {
                    employee_id = employee.Id,
                    username = BuildInternalUsername(employee.employee_code, employee.Id),
                    firebase_uid = Truncate(firebaseUid ?? $"email:{normalizedEmailLower}", 128),
                    is_active = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(localUser);
                await _context.SaveChangesAsync();
            }

            var shouldSaveLocalUser = false;
            if (!string.IsNullOrWhiteSpace(firebaseUid) &&
                !string.Equals(localUser.firebase_uid, firebaseUid, StringComparison.Ordinal))
            {
                localUser.firebase_uid = Truncate(firebaseUid, 128);
                shouldSaveLocalUser = true;
            }

            var desiredUsername = BuildInternalUsername(localUser.Employee?.employee_code, localUser.Employee?.Id ?? localUser.Id);
            if (!string.IsNullOrWhiteSpace(desiredUsername) &&
                !string.Equals(localUser.username, desiredUsername, StringComparison.Ordinal))
            {
                localUser.username = desiredUsername;
                shouldSaveLocalUser = true;
            }

            if (shouldSaveLocalUser)
            {
                localUser.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            await EnsureLoginRolesAsync(localUser.Id, normalizedEmail);

            return await _context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == localUser.Id && u.is_active);
        }

        private async Task<EmployeeEntity?> EnsureEmployeeForLoginAsync(string email, bool allowAutoProvisionEmployee)
        {
            var normalizedEmailLower = email.Trim().ToLower();

            var employee = await _context.Employees.FirstOrDefaultAsync(e =>
                e.is_active &&
                (
                    (!string.IsNullOrWhiteSpace(e.email) && e.email.ToLower() == normalizedEmailLower) ||
                    (!string.IsNullOrWhiteSpace(e.work_email) && e.work_email.ToLower() == normalizedEmailLower)
                ));

            if (employee != null)
            {
                return employee;
            }

            if (!allowAutoProvisionEmployee && !IsMasterEmail(email))
            {
                return null;
            }

            employee = new EmployeeEntity
            {
                employee_code = Truncate(
                    (IsMasterEmail(email) ? $"ADMIN_{Guid.NewGuid():N}" : $"EMP_{Guid.NewGuid():N}")
                        .ToUpperInvariant(),
                    20),
                full_name = IsMasterEmail(email) ? "System Administrator" : email.Split('@')[0],
                email = email,
                work_email = email,
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return employee;
        }

        private async Task EnsureLoginRolesAsync(int userId, string email)
        {
            try
            {
                // 1. Rename existing legacy roles if they exist
                var legacyRoles = await _context.Roles
                    .IgnoreQueryFilters()
                    .Where(r => r.name == "Admin" || r.name == "Manager" || r.name == "User")
                    .ToListAsync();

                foreach (var legacyRole in legacyRoles)
                {
                    if (legacyRole.name == "Admin") legacyRole.name = AuthSecurityConstants.RoleAdmin;
                    else if (legacyRole.name == "Manager") legacyRole.name = AuthSecurityConstants.RoleDeptManager;
                    else if (legacyRole.name == "User") legacyRole.name = AuthSecurityConstants.RoleEmployee;

                    legacyRole.UpdatedAt = DateTime.UtcNow;
                }

                if (legacyRoles.Any())
                {
                    await _context.SaveChangesAsync();
                }

                // 2. Ensure all 7 predefined roles exist with correct IDs
                await EnsureRoleExistsAsync(AuthSecurityConstants.RoleAdmin, "Quản trị hệ thống cao nhất", AuthSecurityConstants.RoleAdminId);
                await EnsureRoleExistsAsync(AuthSecurityConstants.RoleDirector, "Thành viên Ban giám đốc", AuthSecurityConstants.RoleDirectorId);
                await EnsureRoleExistsAsync(AuthSecurityConstants.RoleRegionManager, "Quản lý theo vùng/miền", AuthSecurityConstants.RoleRegionManagerId);
                await EnsureRoleExistsAsync(AuthSecurityConstants.RoleBranchManager, "Quản lý tại chi nhánh", AuthSecurityConstants.RoleBranchManagerId);
                await EnsureRoleExistsAsync(AuthSecurityConstants.RoleDeptManager, "Quản lý phòng ban/bộ phận", AuthSecurityConstants.RoleDeptManagerId);
                await EnsureRoleExistsAsync(AuthSecurityConstants.RoleModuleAdmin, "Quản trị các phân hệ nghiệp vụ", AuthSecurityConstants.RoleModuleAdminId);
                await EnsureRoleExistsAsync(AuthSecurityConstants.RoleEmployee, "Nhân viên chính thức", AuthSecurityConstants.RoleEmployeeId);

                // 3. Logic assigning default role for new users
                var activeRoleIds = await _context.UserRoles
                    .IgnoreQueryFilters()
                    .Where(ur => ur.user_id == userId && ur.is_active)
                    .Select(ur => ur.role_id)
                    .ToListAsync();

                var isMasterEmail = IsMasterEmail(email);
                var defaultRoleId = isMasterEmail ? AuthSecurityConstants.RoleAdminId : AuthSecurityConstants.RoleEmployeeId;

                if (activeRoleIds.Count == 0)
                {
                    _context.UserRoles.Add(new UserRoles
                    {
                        user_id = userId,
                        role_id = defaultRoleId,
                        assignment_reason = "Initial Login Synchronization",
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });

                    await _context.SaveChangesAsync();
                    return;
                }

                if (isMasterEmail && !activeRoleIds.Contains(AuthSecurityConstants.RoleAdminId))
                {
                    _context.UserRoles.Add(new UserRoles
                    {
                        user_id = userId,
                        role_id = AuthSecurityConstants.RoleAdminId,
                        assignment_reason = "Master Email Promotion",
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error synchronizing roles during login");
            }
        }

        private async Task<int> EnsureRoleExistsAsync(string roleName, string description, int? roleId = null)
        {
            Roles? existingRole = null;

            // 1. Try find by ID
            if (roleId.HasValue)
            {
                existingRole = await _context.Roles.FirstOrDefaultAsync(r => r.Id == roleId.Value);
            }

            // 2. Try find by Name (including old English names)
            if (existingRole == null)
            {
                var lowerName = roleName.ToLower();
                // Map old names to new ones if searching for the first time
                var oldNames = new List<string> { lowerName };
                if (lowerName == "quản trị") oldNames.Add("admin");
                if (lowerName == "ban giám đốc") oldNames.Add("manager");
                if (lowerName == "nhân viên") oldNames.Add("user");

                existingRole = await _context.Roles
                    .FirstOrDefaultAsync(role => oldNames.Contains(role.name.ToLower()));
            }

            if (existingRole != null)
            {
                bool needsUpdate = false;
                if (existingRole.name != roleName)
                {
                    existingRole.name = roleName;
                    needsUpdate = true;
                }
                if (existingRole.description != description)
                {
                    existingRole.description = description;
                    needsUpdate = true;
                }
                if (!existingRole.is_active)
                {
                    existingRole.is_active = true;
                    needsUpdate = true;
                }

                if (needsUpdate)
                {
                    existingRole.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return existingRole.Id;
            }

            var role = new Roles
            {
                // We don't set ID here to avoid IDENTITY constraint issues
                name = roleName,
                description = description,
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return role.Id;
        }

        private string? GetMasterEmail()
        {
            return _configuration["AdminSettings:MasterEmail"]?.Trim();
        }

        private bool IsMasterEmail(string? email)
        {
            var masterEmail = GetMasterEmail();
            return !string.IsNullOrWhiteSpace(masterEmail) &&
                   !string.IsNullOrWhiteSpace(email) &&
                   string.Equals(email.Trim(), masterEmail.Trim(), StringComparison.OrdinalIgnoreCase);
        }

        private async Task<UserInfoDto?> BuildUserInfoAsync(Users? localUser)
        {
            if (localUser == null)
            {
                return null;
            }

            var roles = await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == localUser.Id && ur.is_active)
                .Include(ur => ur.Role)
                .Select(ur => ur.Role != null ? ur.Role.name : null)
                .Where(roleName => !string.IsNullOrWhiteSpace(roleName))
                .Select(roleName => roleName!)
                .ToListAsync();

            var primaryEmail = localUser.Employee?.email;
            if (string.IsNullOrWhiteSpace(primaryEmail))
            {
                primaryEmail = localUser.Employee?.work_email ?? string.Empty;
            }

            if (IsMasterEmail(primaryEmail) &&
                !roles.Contains(AuthSecurityConstants.RoleSuperAdmin, StringComparer.OrdinalIgnoreCase))
            {
                roles.Insert(0, AuthSecurityConstants.RoleSuperAdmin);
            }

            return new UserInfoDto
            {
                UserId = localUser.Id,
                TenantId = localUser.tenant_id,
                EmployeeId = localUser.Employee?.Id ?? 0,
                Email = primaryEmail ?? string.Empty,
                FullName = localUser.Employee?.full_name ?? localUser.username,
                EmployeeCode = localUser.Employee?.employee_code ?? string.Empty,
                PhoneNumber = localUser.Employee?.phone ?? string.Empty,
                IsActive = localUser.is_active,
                Roles = roles
            };
        }

        private static bool CanAccessAdminSurface(IEnumerable<string>? roles)
        {
            if (roles == null)
            {
                return false;
            }

            var allowedRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                AuthSecurityConstants.RoleSuperAdmin,
                "Admin",
                "Manager",
                AuthSecurityConstants.RoleAdmin,
                AuthSecurityConstants.RoleDirector,
                AuthSecurityConstants.RoleRegionManager,
                AuthSecurityConstants.RoleBranchManager,
                AuthSecurityConstants.RoleDeptManager,
                AuthSecurityConstants.RoleModuleAdmin
            };

            return roles.Any(role =>
                !string.IsNullOrWhiteSpace(role) &&
                allowedRoles.Contains(role));
        }

        private async Task<AuthResponseDto> CreateSessionResponseAsync(int userId, UserInfoDto userInfo, AuthSessionContextDto sessionContext, string message)
        {
            var utcNow = DateTime.UtcNow;
            var sessionId = Guid.NewGuid().ToString("N");
            var refreshToken = AuthTokenSecurity.GenerateOpaqueToken();
            var csrfToken = AuthTokenSecurity.GenerateOpaqueToken(32);

            var authSession = BuildSession(userId, sessionId, refreshToken, csrfToken, sessionContext, utcNow);
            authSession.last_used_at = utcNow;

            _context.AuthSessions.Add(authSession);
            await _context.SaveChangesAsync();

            return BuildAuthResponse(userInfo, sessionId, refreshToken, csrfToken, message);
        }

        private AuthSessions BuildSession(int userId, string sessionId, string refreshToken, string csrfToken, AuthSessionContextDto sessionContext, DateTime utcNow)
        {
            return new AuthSessions
            {
                user_id = userId,
                session_id = sessionId,
                refresh_token_hash = AuthTokenSecurity.ComputeHash(refreshToken),
                csrf_token_hash = AuthTokenSecurity.ComputeHash(csrfToken),
                expires_at = utcNow.AddDays(GetRefreshTokenExpiryInDays()),
                ip_address = Truncate(sessionContext.IpAddress, 128),
                user_agent = Truncate(sessionContext.UserAgent, 512),
                is_active = true,
                CreatedAt = utcNow,
                UpdatedAt = utcNow
            };
        }

        private AuthResponseDto BuildAuthResponse(UserInfoDto user, string sessionId, string refreshToken, string csrfToken, string message)
        {
            return new AuthResponseDto
            {
                Success = true,
                Message = message,
                IdToken = GenerateInternalToken(user, sessionId),
                RefreshToken = refreshToken,
                CsrfToken = csrfToken,
                ExpiresIn = (int)TimeSpan.FromMinutes(GetAccessTokenExpiryInMinutes()).TotalSeconds,
                User = user
            };
        }

        private List<Claim> CreateBaseClaims(UserInfoDto user, string sessionId)
        {
            return new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new(ClaimTypes.Email, user.Email ?? string.Empty),
                new(ClaimTypes.Name, user.FullName ?? user.Email ?? string.Empty),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(AuthSecurityConstants.SessionIdClaimType, sessionId),
                new(AuthSecurityConstants.TokenTypeClaimType, AuthSecurityConstants.AccessTokenType),
                // FIX: Ensure tenant_id is always set to a valid number (0 as fallback for null)
                new("tenant_id", user.TenantId?.ToString() ?? "0"),
                new("EmployeeId", user.EmployeeId.ToString()),
                new("EmployeeCode", user.EmployeeCode ?? string.Empty)
            };
        }

        private async Task RevokeAllActiveSessionsAsync(int userId, DateTime utcNow, string note)
        {
            var activeSessions = await _context.AuthSessions
                .Where(session => session.user_id == userId && session.is_active && !session.revoked_at.HasValue)
                .ToListAsync();

            foreach (var session in activeSessions)
            {
                MarkSessionRevoked(session, utcNow, note);
            }

            await _context.SaveChangesAsync();
        }

        private static void MarkSessionRevoked(AuthSessions session, DateTime utcNow, string _, string? replacedBySessionId = null)
        {
            session.is_active = false;
            session.revoked_at = utcNow;
            session.replaced_by_session_id = replacedBySessionId;
            session.last_used_at = utcNow;
            session.UpdatedAt = utcNow;
        }

        private SymmetricSecurityKey GetJwtSigningKey()
        {
            var secret = _configuration["JwtSettings:Secret"];
            if (string.IsNullOrWhiteSpace(secret))
            {
                throw new InvalidOperationException("JwtSettings:Secret is missing");
            }

            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        }

        private double GetAccessTokenExpiryInMinutes()
        {
            return double.TryParse(_configuration["JwtSettings:ExpiryInMinutes"], out var minutes)
                ? minutes
                : 10;
        }

        private double GetRefreshTokenExpiryInDays()
        {
            return double.TryParse(_configuration["JwtSettings:RefreshExpiryInDays"], out var days)
                ? days
                : 7;
        }

        private static string BuildInternalUsername(string? employeeCode, int fallbackId)
        {
            var rawValue = !string.IsNullOrWhiteSpace(employeeCode)
                ? $"usr_{employeeCode.Trim()}"
                : $"usr_{fallbackId}";

            return Truncate(rawValue, 50);
        }

        private static string Truncate(string? value, int maxLength)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            return value.Length <= maxLength ? value : value[..maxLength];
        }

        private sealed class FirebaseLoginResponse
        {
            public string idToken { get; set; } = string.Empty;
            public string email { get; set; } = string.Empty;
            public string refreshToken { get; set; } = string.Empty;
            public string expiresIn { get; set; } = string.Empty;
            public string localId { get; set; } = string.Empty;
            public bool registered { get; set; }
        }
        public async Task<InvitationResponseDto> GenerateInvitationAsync(InvitationRequestDto dto, int creatorId)
        {
            try
            {
                var token = AuthTokenSecurity.GenerateOpaqueToken(32);
                var expiresAt = DateTime.UtcNow.AddDays(dto.ExpirationDays);

                var invitation = new InvitationTokens
                {
                    Token = token,
                    Email = dto.Email,
                    EmployeeId = dto.EmployeeId,
                    ExpiresAt = expiresAt,
                    CreatedBy = creatorId,
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.InvitationTokens.Add(invitation);
                await _context.SaveChangesAsync();

                // Build the invitation link (this should ideally come from configuration)
                var baseUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:3000";
                var invitationLink = $"{baseUrl}/register?token={token}&email={Uri.EscapeDataString(dto.Email)}";

                return new InvitationResponseDto
                {
                    Success = true,
                    Message = "Tạo link mời thành công.",
                    InvitationLink = invitationLink,
                    Token = token,
                    ExpiresAt = expiresAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GenerateInvitationAsync");
                return new InvitationResponseDto { Success = false, Message = "Lỗi khi tạo link mời." };
            }
        }

        public async Task<InvitationValidationDto> ValidateInvitationTokenAsync(string token)
        {
            try
            {
                var invitation = await _context.InvitationTokens
                    .Include(i => i.Employee)
                    .FirstOrDefaultAsync(i => i.Token == token);

                if (invitation == null)
                {
                    return new InvitationValidationDto { Valid = false, Message = "Mã mời không tồn tại." };
                }

                if (invitation.IsUsed)
                {
                    return new InvitationValidationDto { Valid = false, Message = "Mã mời đã được sử dụng." };
                }

                if (invitation.ExpiresAt < DateTime.UtcNow)
                {
                    return new InvitationValidationDto { Valid = false, Message = "Mã mời đã hết hạn." };
                }

                return new InvitationValidationDto
                {
                    Valid = true,
                    Email = invitation.Email,
                    FullName = invitation.Employee?.full_name ?? "",
                    Message = "Mã mời hợp lệ."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ValidateInvitationTokenAsync");
                return new InvitationValidationDto { Valid = false, Message = "Lỗi khi kiểm tra mã mời." };
            }
        }

        public async Task<bool> IsSystemBootstrappedAsync()
        {
            try
            {
                return await _context.UserRoles
                    .AnyAsync(ur => ur.is_active && 
                        (ur.Role.name == AuthSecurityConstants.RoleSuperAdmin || ur.Role.name == "Quản trị" || ur.role_id == 1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in IsSystemBootstrappedAsync");
                return false;
            }
        }

        public async Task<AuthResponseDto> BootstrapSystemAsync()
        {
            try
            {
                var masterEmail = GetMasterEmail();
                if (string.IsNullOrWhiteSpace(masterEmail))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Chua cau hinh MasterEmail trong appsettings.json."
                    };
                }

                _logger.LogInformation("Starting system bootstrap for {Email}", masterEmail);

                var superAdminRole = await _context.Roles.FirstOrDefaultAsync(r => r.name == AuthSecurityConstants.RoleSuperAdmin);
                if (superAdminRole == null)
                {
                    superAdminRole = new Roles 
                    { 
                        name = AuthSecurityConstants.RoleSuperAdmin,
                        description = "Hệ thống quản trị cao cấp (Super Admin)",
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Roles.Add(superAdminRole);
                    await _context.SaveChangesAsync();
                }

                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.email == masterEmail);
                if (employee == null)
                {
                    employee = new ERP.Entities.Models.Employees
                    {
                        employee_code = "SA_ADMIN",
                        full_name = "Super Administrator",
                        email = masterEmail,
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Employees.Add(employee);
                    await _context.SaveChangesAsync();
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.employee_id == employee.Id);
                if (user == null)
                {
                    user = new Users
                    {
                        employee_id = employee.Id,
                        username = masterEmail,
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }

                var hasRole = await _context.UserRoles.AnyAsync(ur => ur.user_id == user.Id && ur.role_id == superAdminRole.Id);
                if (!hasRole)
                {
                    _context.UserRoles.Add(new UserRoles
                    {
                        user_id = user.Id,
                        role_id = superAdminRole.Id,
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                    await _context.SaveChangesAsync();
                }

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "He thong da duoc bootstrap thanh cong. Vui long dang nhap bang tai khoan admin@nexahrm.com",
                    User = await BuildUserInfoAsync(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in BootstrapSystemAsync");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Loi trong qua trinh bootstrap: {ex.Message}"
                };
            }
        }
    }
}
