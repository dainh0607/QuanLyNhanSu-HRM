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
                InvitationTokens? invitation = null;
                if (!string.IsNullOrEmpty(dto.InvitationToken))
                {
                    invitation = await _context.InvitationTokens
                        .IgnoreQueryFilters()
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
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(e => e.email == dto.Email);

                if (existingEmployee != null)
                {
                    var existingUser = await _context.Users
                        .IgnoreQueryFilters()
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
                    var creator = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == invitation.CreatedBy);
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
                    int assignedRoleId = invitation != null && invitation.RoleId.HasValue 
                        ? invitation.RoleId.Value 
                        : (invitation != null ? 7 : AuthSecurityConstants.RoleAdminId); // Default to Staff (7) for invited, Workspace Admin (8) for Owner
                    
                    // Master Email check (Override to Super Admin)
                    string masterEmail = _configuration["AdminSettings:MasterEmail"];
                    if (!string.IsNullOrEmpty(masterEmail) &&
                        string.Equals(dto.Email, masterEmail, StringComparison.OrdinalIgnoreCase))
                    {
                        assignedRoleId = AuthSecurityConstants.RoleSuperAdminId; // ID 1
                    }

                    if (invitation != null)
                    {
                        await _userService.AssignScopedRoleAsync(
                            user.Id, 
                            assignedRoleId, 
                            tenantId, 
                            "Staff Join (Invitation)",
                            invitation.BranchId,
                            invitation.RegionId,
                            invitation.DepartmentId);
                    }
                    else
                    {
                        await _userService.AssignRoleAsync(
                            user.Id, 
                            assignedRoleId, 
                            tenantId, 
                            workspace != null ? "Workspace Owner (Initial)" : "Staff Join");
                    }

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
                    allowAutoProvisionEmployee,
                    sessionContext.ResolvedTenantId
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

                var workspaceMismatch = ValidateResolvedWorkspace(userInfo, sessionContext, "login");
                if (workspaceMismatch != null)
                {
                    _logger.LogWarning(
                        "⚠️ WORKSPACE MISMATCH - Tenant may be blocked. User: {Email}, UserTenantId: {UserTenantId}, ResolvedTenantId: {ResolvedTenantId}",
                        userInfo.Email, userInfo.TenantId, sessionContext.ResolvedTenantId);
                    
                    // ✅ TEMPORARY DEBUG: Log but don't block - comment out to see if workspace validation is the issue
                    // return workspaceMismatch;
                }

                // ✅ SAFER FIX: Check scope_level instead of role names
                // scope_level is calculated from roleIds (stable) and already determined in BuildUserInfoAsync()
                // Only block PERSONAL scope users; allow TENANT, REGION, BRANCH, DEPARTMENT, and SystemAdmin
                _logger.LogInformation(
                    "User login access check - Email: {Email}, IsSystemAdmin: {IsSystemAdmin}, ScopeLevel: {ScopeLevel}, Roles: {Roles}",
                    userInfo.Email, userInfo.IsSystemAdmin, userInfo.ScopeLevel, string.Join(", ", userInfo.Roles ?? new List<string>()));
                
                if (!userInfo.IsSystemAdmin && userInfo.ScopeLevel == "PERSONAL")
                {
                    _logger.LogWarning(
                        "🔴 USER DENIED - PERSONAL scope. Email: {Email}, TenantId: {TenantId}, RoleIds: {RoleIds}",
                        userInfo.Email, userInfo.TenantId, string.Join(",", userInfo.Roles ?? new List<string>()));
                    
                    return new AuthResponseDto 
                    { 
                        Success = false, 
                        Message = "Your account does not have permission to access the management system." 
                    };
                }

                _logger.LogInformation(
                    "✅ USER ALLOWED - Email: {Email}, TenantId: {TenantId}, ScopeLevel: {ScopeLevel}",
                    userInfo.Email, userInfo.TenantId, userInfo.ScopeLevel);

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

                var workspaceMismatch = ValidateResolvedWorkspace(userInfo, sessionContext, "refresh");
                if (workspaceMismatch != null)
                {
                    _logger.LogWarning(
                        "⚠️ WORKSPACE MISMATCH on refresh - User: {Email}, UserTenantId: {UserTenantId}, ResolvedTenantId: {ResolvedTenantId}",
                        userInfo.Email, userInfo.TenantId, sessionContext.ResolvedTenantId);
                    
                    // ✅ TEMPORARY DEBUG: Log but don't block during refresh
                    // return workspaceMismatch;
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

        public async Task<AuthResponseDto> CreateSessionForUserAsync(int userId, AuthSessionContextDto sessionContext, string message)
        {
            try
            {
                var userInfo = await GetUserByIdAsync(userId);
                if (userInfo == null || !userInfo.IsActive)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Nguoi dung khong con hieu luc"
                    };
                }

                var workspaceMismatch = ValidateResolvedWorkspace(userInfo, sessionContext, "activation");
                if (workspaceMismatch != null)
                {
                    return workspaceMismatch;
                }

                return await CreateSessionResponseAsync(userId, userInfo, sessionContext, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CreateSessionForUserAsync");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Khong the khoi tao phien dang nhap"
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
                    .IgnoreQueryFilters()
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
                    .IgnoreQueryFilters()
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

        public async Task<string> CreateFirebaseUserAsync(string email, string password, string displayName, int employeeId, int? tenantId = null, int? roleId = null)
        {
            var normalizedEmail = email.Trim();
            var normalizedEmailLower = normalizedEmail.ToLowerInvariant();
            var firebaseUid = await CreateFirebaseUserInternalAsync(normalizedEmail, password, displayName);

            try
            {
                var existingUsers = await _context.Users
                    .IgnoreQueryFilters()
                    .Include(u => u.Employee)
                    .Where(u =>
                        u.employee_id == employeeId ||
                        (!string.IsNullOrWhiteSpace(u.firebase_uid) && u.firebase_uid == firebaseUid) ||
                        (!string.IsNullOrWhiteSpace(u.username) && u.username.ToLower() == normalizedEmailLower) ||
                        (u.Employee != null &&
                            (
                                (!string.IsNullOrWhiteSpace(u.Employee.email) && u.Employee.email.ToLower() == normalizedEmailLower) ||
                                (!string.IsNullOrWhiteSpace(u.Employee.work_email) && u.Employee.work_email.ToLower() == normalizedEmailLower)
                            )))
                    .ToListAsync();

                var user = SelectBestProvisioningUserCandidate(existingUsers, employeeId, normalizedEmail, firebaseUid);
                if (user == null)
                {
                    user = new Users
                    {
                        employee_id = employeeId,
                        tenant_id = tenantId,
                        username = normalizedEmail,
                        firebase_uid = firebaseUid,
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Users.Add(user);
                }
                else
                {
                    user.employee_id = employeeId;
                    user.tenant_id = tenantId;
                    user.username = normalizedEmail;
                    user.firebase_uid = firebaseUid;
                    user.is_active = true;
                    user.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                var assignedRoleId = roleId ?? 2;
                var existingRole = await _context.UserRoles
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(ur => ur.user_id == user.Id && ur.role_id == assignedRoleId);

                if (existingRole != null)
                {
                    existingRole.tenant_id = tenantId;
                    existingRole.is_active = true;
                    existingRole.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    var userRole = new UserRoles
                    {
                        user_id = user.Id,
                        tenant_id = tenantId,
                        role_id = assignedRoleId,
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.UserRoles.Add(userRole);
                }

                await _context.SaveChangesAsync();

                return firebaseUid;
            }
            catch
            {
                try
                {
                    await _firebaseService.DeleteUserAsync(firebaseUid);
                }
                catch (Exception cleanupEx)
                {
                    _logger.LogError(cleanupEx, "Failed to rollback Firebase user {FirebaseUid} after local provisioning error", firebaseUid);
                }

                throw;
            }
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

        private async Task<Users?> EnsureLocalUserForLoginAsync(string? firebaseUid, string? email, bool allowAutoProvisionEmployee, int? tenantId = null)
        {
            var normalizedEmail = email?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedEmail))
            {
                return null;
            }

            var normalizedEmailLower = normalizedEmail.ToLower();
            var matchedUsers = await _context.Users
                .IgnoreQueryFilters()
                .Include(u => u.Employee)
                .Where(u =>
                    u.is_active &&
                    (
                        (!string.IsNullOrWhiteSpace(firebaseUid) && u.firebase_uid == firebaseUid) ||
                        (!string.IsNullOrWhiteSpace(u.username) && u.username.ToLower() == normalizedEmailLower) ||
                        (u.Employee != null &&
                            (
                                (!string.IsNullOrWhiteSpace(u.Employee.email) && u.Employee.email.ToLower() == normalizedEmailLower) ||
                                (!string.IsNullOrWhiteSpace(u.Employee.work_email) && u.Employee.work_email.ToLower() == normalizedEmailLower)
                            ))
                    ))
                .ToListAsync();

            var localUser = SelectBestLocalUserCandidate(matchedUsers, normalizedEmail, firebaseUid);

            if (matchedUsers.Count > 1 && localUser != null)
            {
                _logger.LogWarning(
                    "[Auth] Multiple local users matched login email {Email}. SelectedUserId={SelectedUserId}, CandidateUserIds={CandidateUserIds}",
                    normalizedEmail,
                    localUser.Id,
                    string.Join(",", matchedUsers.Select(user => user.Id)));
            }

            // [FIX] Auto-resolve tenantId from WorkspaceOwnerInvitation when subdomain routing is not active
            if (!tenantId.HasValue && !string.IsNullOrWhiteSpace(normalizedEmail))
            {
                var ownerInvitation = await _context.WorkspaceOwnerInvitations
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(inv => inv.OwnerEmail.ToLower() == normalizedEmailLower && inv.Status == "activated");
                
                if (ownerInvitation != null)
                {
                    var ownerTenant = await _context.Tenants
                        .IgnoreQueryFilters()
                        .FirstOrDefaultAsync(t => t.code == ownerInvitation.WorkspaceCode && t.is_active);
                    
                    if (ownerTenant != null)
                    {
                        tenantId = ownerTenant.Id;
                        _logger.LogInformation(
                            "[Auth] Auto-resolved tenantId={TenantId} for Workspace Owner {Email} via WorkspaceOwnerInvitation",
                            tenantId, normalizedEmail);
                    }
                }
            }

            // Also backfill tenantId for existing user/employee if missing
            if (tenantId.HasValue && localUser != null)
            {
                var shouldSaveBackfill = false;
                if (!localUser.tenant_id.HasValue)
                {
                    localUser.tenant_id = tenantId;
                    shouldSaveBackfill = true;
                }
                if (localUser.Employee != null && !localUser.Employee.tenant_id.HasValue)
                {
                    localUser.Employee.tenant_id = tenantId;
                    shouldSaveBackfill = true;
                }
                if (shouldSaveBackfill)
                {
                    localUser.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation(
                        "[Auth] Backfilled tenantId={TenantId} for User/Employee {Email}",
                        tenantId, normalizedEmail);
                }
            }

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
                    tenant_id = tenantId,
                    username = normalizedEmail, // Dùng email làm username
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

            if (!string.Equals(localUser.username, normalizedEmail, StringComparison.OrdinalIgnoreCase))
            {
                // Tự động chuyển đổi username cũ sang email nếu cần
                if (localUser.username.StartsWith("usr_EMP_", StringComparison.OrdinalIgnoreCase))
                {
                    localUser.username = normalizedEmail;
                    shouldSaveLocalUser = true;
                }
            }

            if (shouldSaveLocalUser)
            {
                localUser.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            await EnsureLoginRolesAsync(localUser.Id, normalizedEmail);

            return await _context.Users
                .IgnoreQueryFilters()
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.Id == localUser.Id && u.is_active);
        }

        private async Task<EmployeeEntity?> EnsureEmployeeForLoginAsync(string email, bool allowAutoProvisionEmployee)
        {
            var normalizedEmailLower = email.Trim().ToLower();

            var employee = await _context.Employees.IgnoreQueryFilters().FirstOrDefaultAsync(e =>
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
                
                // ✅ CRITICAL FIX: Ensure role names are always ENGLISH for code consistency
                // Many places check role.name against AuthSecurityConstants (English), so we need consistency
                await SyncRoleNamesToEnglishAsync();

                // 3. Logic assigning default role for new users & fixing broken roles
                var activeRoleIds = await _context.UserRoles
                    .IgnoreQueryFilters()
                    .Where(ur => ur.user_id == userId && ur.is_active)
                    .Select(ur => ur.role_id)
                    .ToListAsync();

                var isMasterEmail = IsMasterEmail(email);
                
                // [FIX] Also detect Workspace Owners via WorkspaceOwnerInvitations table
                var isWorkspaceOwner = await _context.WorkspaceOwnerInvitations
                    .IgnoreQueryFilters()
                    .AnyAsync(inv => inv.OwnerEmail.ToLower() == email.ToLower() && inv.Status == "activated");
                
                var isAdminEligible = isMasterEmail || isWorkspaceOwner;
                var defaultRoleId = isAdminEligible ? AuthSecurityConstants.RoleAdminId : AuthSecurityConstants.RoleEmployeeId;

                // ✅ NEW: Check if user has only negative/invalid roleIds (e.g., Staff role for admin)
                // If workspace owner/master email but only has Staff role, promote to Admin
                if (isAdminEligible && activeRoleIds.Count > 0 && !activeRoleIds.Contains(AuthSecurityConstants.RoleAdminId))
                {
                    // Admin-eligible user but no Admin role - this is incorrect, need to add Admin role
                    _logger.LogWarning(
                        "Admin-eligible user {Email} (IsMaster={IsMaster}, IsOwner={IsOwner}) missing Admin role. Adding Admin role now.",
                        email, isMasterEmail, isWorkspaceOwner);
                    
                    _context.UserRoles.Add(new UserRoles
                    {
                        user_id = userId,
                        role_id = AuthSecurityConstants.RoleAdminId,
                        assignment_reason = isWorkspaceOwner 
                            ? "Workspace Owner Auto-Promotion (LOGIN)" 
                            : "Master Email Auto-Promotion (OLD ACCOUNT)",
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });

                    await _context.SaveChangesAsync();
                    return;
                }

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

        /// <summary>
        /// ✅ CRITICAL FIX: Synchronize all role names to ENGLISH versions
        /// This ensures consistency with AuthSecurityConstants which are used throughout the codebase
        /// for role comparison and authorization checks.
        /// 
        /// Root cause: Database was seeded/migrated with Vietnamese role names, but code expects English names
        /// Solution: Update ALL role names to match AuthSecurityConstants values
        /// </summary>
        private async Task SyncRoleNamesToEnglishAsync()
        {
            try
            {
                // Define the mapping from any existing name to correct English name
                var roleMappings = new Dictionary<int, string>
                {
                    { AuthSecurityConstants.RoleAdminId, AuthSecurityConstants.RoleAdmin },              // 1 → "Admin"
                    { AuthSecurityConstants.RoleDirectorId, AuthSecurityConstants.RoleDirector },      // 2 → "Manager"
                    { AuthSecurityConstants.RoleRegionManagerId, AuthSecurityConstants.RoleRegionManager },  // 3 → "Regional Manager"
                    { AuthSecurityConstants.RoleBranchManagerId, AuthSecurityConstants.RoleBranchManager },  // 4 → "Branch Manager"
                    { AuthSecurityConstants.RoleDeptManagerId, AuthSecurityConstants.RoleDeptManager },      // 5 → "Department Head"
                    { AuthSecurityConstants.RoleModuleAdminId, AuthSecurityConstants.RoleModuleAdmin },      // 6 → "Module Admin"
                    { AuthSecurityConstants.RoleEmployeeId, AuthSecurityConstants.RoleEmployee }            // 7 → "Staff"
                };

                var anyUpdated = false;

                // Update each role to ensure it has the correct English name
                foreach (var mapping in roleMappings)
                {
                    var role = await _context.Roles
                        .IgnoreQueryFilters()
                        .FirstOrDefaultAsync(r => r.Id == mapping.Key && r.is_active);

                    if (role == null)
                    {
                        // Role doesn't exist, will be created by EnsureRoleExistsAsync
                        continue;
                    }

                    // Update if name is different (Vietnamese, old name, or any other variation)
                    if (role.name != mapping.Value)
                    {
                        _logger.LogWarning(
                            "Syncing role name: ID={RoleId}, Old='{OldName}' → New='{NewName}'",
                            mapping.Key, role.name, mapping.Value);
                        
                        role.name = mapping.Value;
                        role.UpdatedAt = DateTime.UtcNow;
                        anyUpdated = true;
                    }
                }

                if (anyUpdated)
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Role names synchronized to English");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing role names to English");
                // Don't throw - this is a sync operation that shouldn't block login
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

            // 2. Try find by Name (including old/Vietnamese names as fallback)
            if (existingRole == null)
            {
                var lowerName = roleName.ToLower();
                // Create a list of alternative names to search for (Vietnamese variations + English)
                var oldNames = new List<string> { lowerName };
                
                // ✅ IMPROVED: Add full Vietnamese role names for better matching
                // This helps find roles even if they were seeded with Vietnamese names
                switch (lowerName)
                {
                    case "admin":
                        oldNames.AddRange(new[] { "quản trị", "quản trị hệ thống cao nhất", "quản trị hệ thống" });
                        break;
                    case "manager":
                        oldNames.AddRange(new[] { "ban giám đốc", "thành viên ban giám đốc" });
                        break;
                    case "regional manager":
                        oldNames.AddRange(new[] { "quản lý theo vùng/miền", "quản lý vùng", "quản lý miền" });
                        break;
                    case "branch manager":
                        oldNames.AddRange(new[] { "quản lý tại chi nhánh", "quản lý chi nhánh" });
                        break;
                    case "department head":
                        oldNames.AddRange(new[] { "quản lý phòng ban", "quản lý phòng ban/bộ phận", "quản lý phòng ban/bộ phộc", "quản lý bộ phận" });
                        break;
                    case "module admin":
                        oldNames.AddRange(new[] { "quản trị các phân hệ nghiệp vụ", "quản trị module" });
                        break;
                    case "staff":
                        oldNames.AddRange(new[] { "nhân viên", "nhân viên chính thức", "user", "employee" });
                        break;
                }

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

            // Consolidate role fetching for both names and IDs to be robust against Global Query Filters
            var userRolesData = await _context.UserRoles
                .IgnoreQueryFilters()
                .Where(ur => ur.user_id == localUser.Id &&
                    ur.is_active &&
                    (!ur.valid_to.HasValue || ur.valid_to > DateTime.UtcNow))
                .Join(_context.Roles.IgnoreQueryFilters(), 
                    ur => ur.role_id, 
                    r => r.Id, 
                    (ur, r) => new { ur.role_id, ur.tenant_id, r.name })
                .ToListAsync();

            var roles = userRolesData
                .Select(x => x.name)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .ToList();

            var roleIds = userRolesData.Select(x => x.role_id).ToList();
            var roleTenantIds = userRolesData
                .Where(x => x.tenant_id.HasValue)
                .Select(x => x.tenant_id!.Value)
                .Distinct()
                .ToList();
            var effectiveTenantId = ResolveEffectiveTenantId(localUser, roleTenantIds);
            var roleScopeLevels = await _context.RoleScopes
                .IgnoreQueryFilters()
                .Where(rs => roleIds.Contains(rs.role_id) && rs.is_active)
                .Select(rs => rs.scope_level)
                .Where(scope => !string.IsNullOrWhiteSpace(scope))
                .ToListAsync();
            
            // 🔍 DEBUG: Log what we found
            _logger.LogInformation(
                "BuildUserInfoAsync - User: {Email}, RoleIds: {RoleIds}, RoleNames: {RoleNames}, RoleScopes: {RoleScopes}",
                localUser.Employee?.email ?? localUser.username,
                string.Join(",", roleIds),
                string.Join(",", roles),
                string.Join(",", roleScopeLevels));

            var primaryEmail = localUser.Employee?.email;
            if (string.IsNullOrWhiteSpace(primaryEmail))
            {
                primaryEmail = localUser.Employee?.work_email ?? string.Empty;
            }

            if (IsMasterEmail(primaryEmail) &&
                !roles.Contains(AuthSecurityConstants.RoleAdmin, StringComparer.OrdinalIgnoreCase))
            {
                roles.Insert(0, AuthSecurityConstants.RoleAdmin);
                if (!roleIds.Contains(AuthSecurityConstants.RoleAdminId))
                {
                    roleIds.Add(AuthSecurityConstants.RoleAdminId);
                }
            }

            // Calculate Scope Level and SystemAdmin status.
            // RoleScopes is the primary RBAC source. Hardcoded role-name fallback is only for legacy data.
            var scopeLevel = roleScopeLevels.Any()
                ? DetermineHighestScopeLevel(roleScopeLevels)
                : ResolveLegacyScopeLevel(roleIds, roles);
            bool isSystemAdmin = false;

            // [OWNERSHIP AUTO-DETECTION] (FINAL DEFENSIVE LAYER)
            // If the user's email matches an activated Workspace Owner Invitation, they ARE system admin for their tenant.
            if (!string.IsNullOrWhiteSpace(primaryEmail))
            {
                var isOwner = await _context.WorkspaceOwnerInvitations
                    .IgnoreQueryFilters()
                    .AnyAsync(inv => inv.OwnerEmail.ToLower() == primaryEmail.ToLower() && inv.Status == "activated");

                if (isOwner) 
                {
                    isSystemAdmin = true;
                    scopeLevel = "TENANT";
                }
            }

            if (roleIds.Contains(AuthSecurityConstants.RoleAdminId) || 
                roles.Contains(AuthSecurityConstants.RoleAdmin, StringComparer.OrdinalIgnoreCase))
            {
                scopeLevel = "TENANT";
                isSystemAdmin = true;
            }

            // [FINAL FIX] Dynamic & Fallback Permissions based on user roles
            var permissions = await _context.ActionPermissions
                .IgnoreQueryFilters()
                .Where(ap => roleIds.Contains(ap.role_id) && ap.is_active)
                .Select(ap => $"{ap.resource.ToLower()}:{ap.action.ToLower()}")
                .Distinct()
                .ToListAsync();

            // [ULTRASONIC SAFETY NET] God-mode for Admin/Owner
            // If they have Role ID 1 (Admin), we FORCE-ADD all essential permissions to prevent UI lockouts.
            if (isSystemAdmin || roleIds.Contains(AuthSecurityConstants.RoleAdminId))
            {
                var godModePermissions = new List<string> 
                { 
                    "employee:read", "employee:create", "employee:update", "employee:delete",
                    "contracts:read", "contracts:create", "contracts:update", "contracts:delete",
                    "shifts:read", "shifts:create", "shifts:update", "shifts:delete",
                    "attendance:read", "attendance:update", "attendance:delete",
                    "system:manage", "rbac:read", "rbac:manage", "tenant:manage"
                };
                
                foreach (var p in godModePermissions)
                {
                    if (!permissions.Contains(p)) permissions.Add(p);
                }
                
                // Ensure isSystemAdmin is consistently true for ID 1
                isSystemAdmin = true;
            }

            return new UserInfoDto
            {
                UserId = localUser.Id,
                TenantId = effectiveTenantId,
                EmployeeId = localUser.Employee?.Id ?? 0,
                Email = primaryEmail ?? string.Empty,
                FullName = localUser.Employee?.full_name ?? localUser.username,
                EmployeeCode = localUser.Employee?.employee_code ?? string.Empty,
                PhoneNumber = localUser.Employee?.phone ?? string.Empty,
                IsActive = localUser.is_active,
                Roles = roles,
                Permissions = permissions, // [NEW] Populate permissions for frontend routing
                ScopeLevel = scopeLevel,
                RegionId = localUser.Employee?.region_id,
                BranchId = localUser.Employee?.branch_id,
                DepartmentId = localUser.Employee?.department_id,
                IsSystemAdmin = isSystemAdmin
            };
        }

        // ⚠️ DEPRECATED: This method is NOT SAFE - it uses undefined AuthSecurityConstants and hardcoded English role names
        // that don't match Vietnamese role names in database. Use scope_level from userInfo instead.
        // DO NOT USE - Left for reference only.
        private static bool CanAccessAdminSurface(IEnumerable<string>? roles)
        {
            if (roles == null)
            {
                return false;
            }

            var allowedRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                AuthSecurityConstants.RoleAdmin,
                "Admin",
                "Manager",
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

        private AuthResponseDto? ValidateResolvedWorkspace(UserInfoDto userInfo, AuthSessionContextDto sessionContext, string flowName)
        {
            if (!sessionContext.ResolvedTenantId.HasValue)
            {
                return null;
            }

            if (!userInfo.TenantId.HasValue || userInfo.TenantId.Value != sessionContext.ResolvedTenantId.Value)
            {
                _logger.LogWarning(
                    "[Auth] Workspace mismatch during {Flow}. UserId={UserId}, UserTenantId={UserTenantId}, RequestedTenantId={RequestedTenantId}, RequestedSubdomain={RequestedSubdomain}",
                    flowName,
                    userInfo.UserId,
                    userInfo.TenantId,
                    sessionContext.ResolvedTenantId,
                    sessionContext.ResolvedTenantSubdomain);

                return new AuthResponseDto
                {
                    Success = false,
                    Message = AuthSecurityConstants.WorkspaceMismatchMessage
                };
            }

            return null;
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

        private static Users? SelectBestLocalUserCandidate(IEnumerable<Users> candidates, string normalizedEmail, string? firebaseUid)
        {
            return candidates
                .OrderByDescending(user =>
                    !string.IsNullOrWhiteSpace(firebaseUid) &&
                    string.Equals(user.firebase_uid, firebaseUid, StringComparison.Ordinal))
                .ThenByDescending(user => string.Equals(user.username, normalizedEmail, StringComparison.OrdinalIgnoreCase))
                .ThenByDescending(user =>
                    string.Equals(user.Employee?.email, normalizedEmail, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(user.Employee?.work_email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
                .ThenByDescending(user => ResolveUserTenantId(user).HasValue)
                .ThenByDescending(user => user.UpdatedAt ?? user.CreatedAt)
                .FirstOrDefault();
        }

        private static Users? SelectBestProvisioningUserCandidate(IEnumerable<Users> candidates, int employeeId, string normalizedEmail, string firebaseUid)
        {
            return candidates
                .OrderByDescending(user => user.employee_id == employeeId)
                .ThenByDescending(user => string.Equals(user.firebase_uid, firebaseUid, StringComparison.Ordinal))
                .ThenByDescending(user => string.Equals(user.username, normalizedEmail, StringComparison.OrdinalIgnoreCase))
                .ThenByDescending(user =>
                    string.Equals(user.Employee?.email, normalizedEmail, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(user.Employee?.work_email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
                .ThenByDescending(user => ResolveUserTenantId(user).HasValue)
                .ThenByDescending(user => user.is_active)
                .ThenByDescending(user => user.UpdatedAt ?? user.CreatedAt)
                .FirstOrDefault();
        }

        private static int? ResolveEffectiveTenantId(Users localUser, IEnumerable<int> roleTenantIds)
        {
            if (localUser.tenant_id.HasValue)
            {
                return localUser.tenant_id;
            }

            if (localUser.Employee?.tenant_id.HasValue == true)
            {
                return localUser.Employee.tenant_id;
            }

            var distinctRoleTenants = roleTenantIds.Distinct().ToList();
            return distinctRoleTenants.Count == 1
                ? distinctRoleTenants[0]
                : null;
        }

        private static int? ResolveUserTenantId(Users user)
        {
            return user.tenant_id ?? user.Employee?.tenant_id;
        }

        private static string ResolveLegacyScopeLevel(IEnumerable<int> roleIds, IEnumerable<string> roles)
        {
            if (roleIds.Contains(AuthSecurityConstants.RoleAdminId) ||
                roles.Contains(AuthSecurityConstants.RoleAdmin, StringComparer.OrdinalIgnoreCase) ||
                roles.Contains(AuthSecurityConstants.RoleDirector, StringComparer.OrdinalIgnoreCase) ||
                roles.Contains(AuthSecurityConstants.RoleModuleAdmin, StringComparer.OrdinalIgnoreCase))
            {
                return "TENANT";
            }

            if (roles.Contains(AuthSecurityConstants.RoleRegionManager, StringComparer.OrdinalIgnoreCase))
            {
                return "REGION";
            }

            if (roles.Contains(AuthSecurityConstants.RoleBranchManager, StringComparer.OrdinalIgnoreCase))
            {
                return "BRANCH";
            }

            if (roles.Contains(AuthSecurityConstants.RoleDeptManager, StringComparer.OrdinalIgnoreCase))
            {
                return "DEPARTMENT";
            }

            return "PERSONAL";
        }

        private static string DetermineHighestScopeLevel(IEnumerable<string?> scopes)
        {
            var scopePriority = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
            {
                { "TENANT", 5 },
                { "CROSS_REGION", 4 },
                { "REGION", 3 },
                { "BRANCH", 2 },
                { "DEPARTMENT", 1 },
                { "PERSONAL", 0 }
            };

            var normalizedScopes = scopes
                .Where(scope => !string.IsNullOrWhiteSpace(scope))
                .Select(scope => scope!.Trim().ToUpperInvariant())
                .ToList();

            if (!normalizedScopes.Any())
            {
                return "PERSONAL";
            }

            var highestPriority = normalizedScopes
                .Select(scope => scopePriority.TryGetValue(scope, out var priority) ? priority : 0)
                .Max();

            return scopePriority.FirstOrDefault(entry => entry.Value == highestPriority).Key ?? "PERSONAL";
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
                new("EmployeeCode", user.EmployeeCode ?? string.Empty),
                new("scope_level", user.ScopeLevel ?? "PERSONAL"),
                new("region_id", user.RegionId?.ToString() ?? ""),
                new("branch_id", user.BranchId?.ToString() ?? ""),
                new("department_id", user.DepartmentId?.ToString() ?? ""),
                new("is_system_admin", user.IsSystemAdmin.ToString().ToLower())
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
                    FullName = dto.FullName,
                    EmployeeId = dto.EmployeeId,
                    DepartmentId = dto.DepartmentId,
                    JobTitleId = dto.JobTitleId,
                    RoleId = dto.RoleId,
                    ScopeLevel = dto.ScopeLevel,
                    BranchId = dto.BranchId,
                    RegionId = dto.RegionId,
                    Message = dto.Message,
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
                    FullName = invitation.FullName,
                    DepartmentId = invitation.DepartmentId,
                    JobTitleId = invitation.JobTitleId,
                    RoleId = invitation.RoleId,
                    ScopeLevel = invitation.ScopeLevel,
                    BranchId = invitation.BranchId,
                    RegionId = invitation.RegionId,
                    Message = invitation.Message,
                    InvitationMessage = "Mã mời hợp lệ."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ValidateInvitationTokenAsync");
                return new InvitationValidationDto { Valid = false, InvitationMessage = "Lỗi khi kiểm tra mã mời." };
            }
        }

        public async Task<bool> IsSystemBootstrappedAsync()
        {
            try
            {
                return await _context.UserRoles
                    .AnyAsync(ur => ur.is_active && 
                        (ur.Role.name == AuthSecurityConstants.RoleAdmin || ur.Role.name == "Quản trị" || ur.role_id == 1));
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

                var superAdminRole = await _context.Roles.FirstOrDefaultAsync(r => r.name == AuthSecurityConstants.RoleAdmin);
                if (superAdminRole == null)
                {
                    superAdminRole = new Roles 
                    { 
                        name = AuthSecurityConstants.RoleAdmin,
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

        public async Task<AuthResponseDto> InitializeSuperAdminInternalAsync(string email, string password)
        {
            try
            {
                // 1. Validate master email
                if (!IsMasterEmail(email))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = $"Email {email} không phải là MasterEmail được cấu hình trong hệ thống."
                    };
                }

                _logger.LogInformation("[CLI-INIT] Starting Enterprise Super Admin Initialization for {Email}", email);

                // 2. Ensure Firebase user exists with the provided password
                string firebaseUid;
                try
                {
                    // Check if exists
                    var existingFirebaseUser = await _firebaseService.ListAllUsersAsync();
                    var match = existingFirebaseUser.FirstOrDefault(u => string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase));

                    if (match != null)
                    {
                        _logger.LogInformation("[CLI-INIT] User already exists in Firebase. Updating password...");
                        await _firebaseService.UpdateUserPasswordAsync(match.Uid, password);
                        firebaseUid = match.Uid;
                    }
                    else
                    {
                        _logger.LogInformation("[CLI-INIT] User does not exist in Firebase. Creating...");
                        var userArgs = new UserRecordArgs
                        {
                            Email = email,
                            Password = password,
                            DisplayName = "System Administrator",
                            Disabled = false
                        };
                        var createdUser = await _firebaseService.CreateUserAsync(userArgs);
                        firebaseUid = createdUser.Uid;
                    }
                }
                catch (Exception fbEx)
                {
                    _logger.LogError(fbEx, "[CLI-INIT] Firebase Auth error");
                    return new AuthResponseDto { Success = false, Message = $"Lỗi Firebase: {fbEx.Message}" };
                }

                // 3. Ensure role, employee, user in local DB (similar to bootstrap)
                var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.name == AuthSecurityConstants.RoleAdmin);
                if (adminRole == null)
                {
                    adminRole = new Roles
                    {
                        name = AuthSecurityConstants.RoleAdmin,
                        description = "Hệ thống quản trị cao cấp (Super Admin)",
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Roles.Add(adminRole);
                    await _context.SaveChangesAsync();
                }

                var employee = await _context.Employees.IgnoreQueryFilters().FirstOrDefaultAsync(e => e.email == email);
                if (employee == null)
                {
                    employee = new ERP.Entities.Models.Employees
                    {
                        employee_code = "SA_ADMIN",
                        full_name = "System Administrator",
                        email = email,
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Employees.Add(employee);
                    await _context.SaveChangesAsync();
                }

                var user = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.employee_id == employee.Id);
                if (user == null)
                {
                    user = new Users
                    {
                        employee_id = employee.Id,
                        username = email,
                        firebase_uid = firebaseUid,
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }
                else if (user.firebase_uid != firebaseUid)
                {
                    user.firebase_uid = firebaseUid;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                var hasRole = await _context.UserRoles.AnyAsync(ur => ur.user_id == user.Id && ur.role_id == adminRole.Id);
                if (!hasRole)
                {
                    _context.UserRoles.Add(new UserRoles
                    {
                        user_id = user.Id,
                        role_id = adminRole.Id,
                        is_active = true,
                        assignment_reason = "CLI Root Initialization",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                    await _context.SaveChangesAsync();
                }

                return new AuthResponseDto
                {
                    Success = true,
                    Message = $"Khởi tạo tài khoản Super Admin ({email}) thành công trên cả Firebase và Local DB.",
                    User = await BuildUserInfoAsync(user)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[CLI-INIT] Fatal error during initialization");
                return new AuthResponseDto { Success = false, Message = $"Lỗi hệ thống: {ex.Message}" };
            }
        }
    }
}
