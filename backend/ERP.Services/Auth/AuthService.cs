using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Models;
using FirebaseAdmin.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace ERP.Services.Auth
{
    public interface IAuthService
    {
        Task<AuthResponseDto> SignUpAsync(SignUpDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto, AuthSessionContextDto sessionContext);
        Task<AuthResponseDto> RefreshSessionAsync(string refreshToken, AuthSessionContextDto sessionContext);
        Task RevokeSessionAsync(string refreshToken);
        Task<UserInfoDto?> GetUserByUidAsync(string uid);
        Task<UserInfoDto?> GetUserByIdAsync(int userId);
        Task<string?> VerifyTokenAsync(string idToken);
        Task<int> SyncFirebaseUsersAsync();
        Task<AuthResponseDto> PreRegisterStaffAsync(PreRegisterStaffDto dto);
        string GenerateInternalToken(UserInfoDto user, string sessionId);
        Task<string> CreateFirebaseUserAsync(string email, string password, string displayName, int employeeId);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AuthService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IFirebaseService _firebaseService;
        private readonly IUserService _userService;

        public AuthService(
            AppDbContext context,
            ILogger<AuthService> logger,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _firebaseService = firebaseService;
            _userService = userService;
        }

        public async Task<AuthResponseDto> SignUpAsync(SignUpDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
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

                var userArgs = new UserRecordArgs
                {
                    Email = dto.Email,
                    Password = dto.Password,
                    DisplayName = dto.FullName,
                    PhoneNumber = dto.PhoneNumber,
                    Disabled = false
                };
                    var firebaseUser = await _firebaseService.CreateUserAsync(userArgs);

                var firebaseUser = await FirebaseAuth.DefaultInstance.CreateUserAsync(userArgs);

                var employeeWithCode = await _context.Employees
                    .FirstOrDefaultAsync(e => e.employee_code == dto.EmployeeCode || e.email == dto.Email);

                var isPreRegistered = employeeWithCode != null;

                if (employeeWithCode == null)
                {
                    employeeWithCode = new EmployeeEntity
                    {
                        employee_code = dto.EmployeeCode,
                        full_name = dto.FullName,
                        email = dto.Email,
                        phone = dto.PhoneNumber,
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Employees.Add(employeeWithCode);
                    await _context.SaveChangesAsync();
                }

                var user = new Users
                {
                    employee_id = employeeWithCode.Id,
                    username = BuildInternalUsername(employeeWithCode.employee_code, employeeWithCode.Id),
                    firebase_uid = firebaseUser.Uid,
                    is_active = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var assignedRoleId = 3;
                var roleName = "User";

                if (dto.Email.ToLower().Contains("admin"))
                {
                    assignedRoleId = 1;
                    roleName = "Admin";
                }
                else if (dto.Email.ToLower().Contains("manager") || !isPreRegistered)
                {
                    assignedRoleId = 2;
                    roleName = "Manager";
                }

                var userRole = new UserRoles
                {
                    user_id = user.Id,
                    role_id = assignedRoleId,
                    is_active = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.UserRoles.Add(userRole);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Dang ky thanh cong. Vui long dang nhap.",
                    User = new UserInfoDto
                    {
                        UserId = user.Id,
                        EmployeeId = employeeWithCode.Id,
                        Email = employeeWithCode.email ?? dto.Email,
                        FullName = employeeWithCode.full_name ?? dto.FullName,
                        EmployeeCode = employeeWithCode.employee_code ?? string.Empty,
                        PhoneNumber = employeeWithCode.phone ?? string.Empty,
                        IsActive = user.is_active,
                        Roles = new List<string> { roleName }
                    }
                };
            }
            catch (FirebaseAuthException ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Firebase error during sign up");

                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Loi Firebase: {ex.AuthErrorCode}"
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
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
                var apiKey = _configuration["Firebase:apiKey"];
                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Firebase API Key is missing"
                    };
                }

                var client = _httpClientFactory.CreateClient();
                var loginUrl = $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={apiKey}";

                var requestBody = new
                {
                    email = dto.Email,
                    password = dto.Password,
                    returnSecureToken = true
                };

                var response = await client.PostAsJsonAsync(loginUrl, requestBody);
                var content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Firebase login failed for {Email}: {Content}", dto.Email, content);
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Email hoac mat khau khong chinh xac"
                    };
                }

                var firebaseResponse = JsonSerializer.Deserialize<FirebaseLoginResponse>(content);
                if (firebaseResponse == null || string.IsNullOrWhiteSpace(firebaseResponse.localId))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Khong the doc phan hoi dang nhap tu Firebase"
                    };
                }

                var localUser = await FindLocalUserForLoginAsync(firebaseResponse.localId, dto.Email);
                if (localUser == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Tai khoan khong duoc tim thay trong he thong local"
                    };
                }

                var shouldUpdateLocalUser = false;
                if (!string.Equals(localUser.firebase_uid, firebaseResponse.localId, StringComparison.Ordinal))
                {
                    localUser.firebase_uid = firebaseResponse.localId;
                    shouldUpdateLocalUser = true;
                }

                var internalUsername = BuildInternalUsername(localUser.Employee?.employee_code, localUser.Employee?.Id ?? localUser.Id);
                if (!string.Equals(localUser.username, internalUsername, StringComparison.Ordinal))
                {
                    localUser.username = internalUsername;
                    shouldUpdateLocalUser = true;
                }

                if (shouldUpdateLocalUser)
                {
                    localUser.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                var userInfo = await BuildUserInfoAsync(localUser);
                if (userInfo == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Khong the tai thong tin nguoi dung"
                    };
                }

                return await CreateSessionResponseAsync(localUser.Id, userInfo, sessionContext, "Dang nhap thanh cong");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in LoginAsync");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Loi xay ra trong qua trinh dang nhap"
                };
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
                    var firebaseUser = await FirebaseAuth.DefaultInstance.GetUserAsync(uid);

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
            var syncCount = 0;

            try
            {
                _logger.LogInformation("Starting Firebase to Local DB synchronization...");

                var pagedEnumerable = FirebaseAuth.DefaultInstance.ListUsersAsync(null);
                var enumerator = pagedEnumerable.GetAsyncEnumerator();

                while (await enumerator.MoveNextAsync())
                {
                    var fbUser = enumerator.Current;
                    var localUser = await _context.Users
                        .Include(u => u.Employee)
                        .FirstOrDefaultAsync(u => u.firebase_uid == fbUser.Uid || u.Employee.email == fbUser.Email);

                    var targetRoleId = 3;
                    if (fbUser.Email?.ToLower().Contains("admin") == true)
                    {
                        targetRoleId = 1;
                    }
                    else if (fbUser.Email?.ToLower().Contains("manager") == true)
                    {
                        targetRoleId = 2;
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

        public async Task<string> CreateFirebaseUserAsync(string email, string password, string displayName, int employeeId)
        {
            var userArgs = new UserRecordArgs
            {
                Email = email,
                Password = password,
                DisplayName = displayName,
                Disabled = false
            };

            var firebaseUser = await FirebaseAuth.DefaultInstance.CreateUserAsync(userArgs);

            var employeeCode = await _context.Employees
                .Where(employee => employee.Id == employeeId)
                .Select(employee => employee.employee_code)
                .FirstOrDefaultAsync();

            var user = new Users
            {
                employee_id = employeeId,
                username = BuildInternalUsername(employeeCode, employeeId),
                firebase_uid = firebaseUser.Uid,
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userRole = new UserRoles
            {
                user_id = user.Id,
                role_id = 3,
                is_active = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return firebaseUser.Uid;
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

        private async Task<Users?> FindLocalUserForLoginAsync(string firebaseUid, string email)
        {
            var localUser = await _context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u => u.firebase_uid == firebaseUid && u.is_active);

            if (localUser != null)
            {
                return localUser;
            }

            return await _context.Users
                .Include(u => u.Employee)
                .FirstOrDefaultAsync(u =>
                    u.is_active &&
                    (u.username == email || u.Employee.email == email));
        }

        private async Task<UserInfoDto?> BuildUserInfoAsync(Users? localUser)
        {
            if (localUser == null)
            {
                return null;
            }

            var roles = await _context.UserRoles
                .Where(ur => ur.user_id == localUser.Id && ur.is_active)
                .Include(ur => ur.Role)
                .Select(ur => ur.Role.name)
                .ToListAsync();

            return new UserInfoDto
            {
                UserId = localUser.Id,
                EmployeeId = localUser.Employee?.Id ?? 0,
                Email = localUser.Employee?.email ?? string.Empty,
                FullName = localUser.Employee?.full_name ?? localUser.username,
                EmployeeCode = localUser.Employee?.employee_code ?? string.Empty,
                PhoneNumber = localUser.Employee?.phone ?? string.Empty,
                IsActive = localUser.is_active,
                Roles = roles
            };
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
    }
}
