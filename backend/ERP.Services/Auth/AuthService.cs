using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Models;
using FirebaseAdmin.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace ERP.Services.Auth
{
    public interface IAuthService
    {
        Task<AuthResponseDto> SignUpAsync(SignUpDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<UserInfoDto?> GetUserByUidAsync(string uid);
        Task<string?> VerifyTokenAsync(string idToken);
        Task<bool> VerifyPasswordAsync(string password, string passwordHash);
        string HashPassword(string password);
        Task<int> SyncFirebaseUsersAsync();
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AuthService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthService(AppDbContext context, ILogger<AuthService> logger, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<AuthResponseDto> SignUpAsync(SignUpDto dto)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Kiểm tra email đã tồn tại chưa
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
                                Message = "Email đã được đăng ký"
                            };
                        }
                    }

                    // 1. Tạo user trong Firebase Access
                    var userArgs = new UserRecordArgs()
                    {
                        Email = dto.Email,
                        Password = dto.Password,
                        DisplayName = dto.FullName,
                        PhoneNumber = dto.PhoneNumber,
                        Disabled = false,
                    };

                    var firebaseUser = await FirebaseAuth.DefaultInstance.CreateUserAsync(userArgs);

                    // 2. Tạo nhân viên trong database local nếu chưa có
                    var employeeWithCode = await _context.Employees
                        .FirstOrDefaultAsync(e => e.employee_code == dto.EmployeeCode);

                    if (employeeWithCode == null)
                    {
                        employeeWithCode = new Employees
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

                    // 3. Tạo user local liên kết với Firebase
                    var user = new Users
                    {
                        employee_id = employeeWithCode.Id,
                        username = dto.Email,
                        password_hash = "firebase", // Không lưu password hash local vì dùng Firebase
                        firebase_uid = firebaseUser.Uid,
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    return new AuthResponseDto
                    {
                        Success = true,
                        Message = "Đăng ký thành công. Vui lòng đăng nhập.",
                        User = new UserInfoDto
                        {
                            UserId = user.Id,
                            EmployeeId = employeeWithCode.Id,
                            Email = employeeWithCode.email,
                            FullName = employeeWithCode.full_name,
                            EmployeeCode = employeeWithCode.employee_code,
                            PhoneNumber = employeeWithCode.phone,
                            IsActive = user.is_active,
                            Roles = new List<string> { "User" }
                        }
                    };
                }
                catch (FirebaseAuthException ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Firebase Error: {ex.Message}");
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = $"Lỗi Firebase: {ex.AuthErrorCode}"
                    };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Error in SignUpAsync: {ex.Message}");
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Lỗi xảy ra trong quá trình đăng ký"
                    };
                }
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            try
            {
                var apiKey = _configuration["Firebase:apiKey"];
                var projectId = _configuration["Firebase:projectId"];

                if (string.IsNullOrEmpty(apiKey))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Firebase API Key is missing"
                    };
                }

                // 1. Xác thực với Firebase Auth REST API
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
                    _logger.LogWarning($"Login failed for {dto.Email}: {content}");
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Email hoặc mật khẩu không chính xác"
                    };
                }

                var firebaseResponse = JsonSerializer.Deserialize<FirebaseLoginResponse>(content);

                // 2. Tìm thông tin user trong Database local
                var localUser = await _context.Users
                    .Include(u => u.Employee)
                    .FirstOrDefaultAsync(u => u.username == dto.Email && u.is_active);

                if (localUser == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Tài khoản không được tìm thấy trong hệ thống local"
                    };
                }

                // Lấy roles
                var userRoles = await _context.UserRoles
                    .Where(ur => ur.user_id == localUser.Id)
                    .Include(ur => ur.Role)
                    .Select(ur => ur.Role.name)
                    .ToListAsync();

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Đăng nhập thành công",
                    IdToken = firebaseResponse.idToken,
                    RefreshToken = firebaseResponse.refreshToken,
                    ExpiresIn = int.Parse(firebaseResponse.expiresIn),
                    User = new UserInfoDto
                    {
                        UserId = localUser.Id,
                        EmployeeId = localUser.Employee.Id,
                        Email = localUser.Employee.email,
                        FullName = localUser.Employee.full_name,
                        EmployeeCode = localUser.Employee.employee_code,
                        PhoneNumber = localUser.Employee.phone,
                        IsActive = localUser.is_active,
                        Roles = userRoles
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in LoginAsync: {ex.Message}");
                return new AuthResponseDto
                {
                    Success = false,
                    Message = "Lỗi xảy ra trong quá trình đăng nhập"
                };
            }
        }

        public async Task<UserInfoDto?> GetUserByUidAsync(string uid)
        {
            try
            {
                // 1. Lấy thông tin từ Firebase
                var userRecord = await FirebaseAuth.DefaultInstance.GetUserAsync(uid);
                
                // 2. Lấy thông tin từ Database local
                var localUser = await _context.Users
                    .Include(u => u.Employee)
                    .FirstOrDefaultAsync(u => u.firebase_uid == uid);

                if (localUser == null) return null;

                // 3. Lấy roles
                var roles = await _context.UserRoles
                    .Where(ur => ur.user_id == localUser.Id)
                    .Include(ur => ur.Role)
                    .Select(ur => ur.Role.name)
                    .ToListAsync();

                return new UserInfoDto
                {
                    UserId = localUser.Id,
                    EmployeeId = localUser.Employee?.Id ?? 0,
                    Email = userRecord.Email,
                    FullName = userRecord.DisplayName ?? localUser.Employee?.full_name,
                    EmployeeCode = localUser.Employee?.employee_code,
                    PhoneNumber = userRecord.PhoneNumber ?? localUser.Employee?.phone,
                    PhotoUrl = userRecord.PhotoUrl,
                    IsActive = localUser.is_active,
                    Roles = roles
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetUserByUidAsync: {ex.Message}");
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
                _logger.LogError($"Error verifying Firebase token: {ex.Message}");
                return null;
            }
        }

        public async Task<bool> VerifyPasswordAsync(string password, string passwordHash)
        {
            // Không sử dụng xác minh local cho Firebase Auth
            return false;
        }

        public string HashPassword(string password)
        {
            // Không sử dụng hashing local cho Firebase Auth
            return "firebase";
        }

        public async Task<int> SyncFirebaseUsersAsync()
        {
            int syncCount = 0;
            try
            {
                _logger.LogInformation("Starting Firebase to Local DB synchronization...");
                
                var pagedEnumerable = FirebaseAuth.DefaultInstance.ListUsersAsync(null);
                var enumerator = pagedEnumerable.GetAsyncEnumerator();

                while (await enumerator.MoveNextAsync())
                {
                    var fbUser = enumerator.Current;
                    
                    // Check if user already exists in local DB
                    var localUser = await _context.Users
                        .FirstOrDefaultAsync(u => u.firebase_uid == fbUser.Uid || u.username == fbUser.Email);

                    if (localUser == null)
                    {
                        _logger.LogInformation($"Syncing new user: {fbUser.Email} ({fbUser.Uid})");

                        using (var transaction = await _context.Database.BeginTransactionAsync())
                        {
                            try
                            {
                                // 1. Create Employee
                                var employeeCode = fbUser.Email?.Split('@')[0].ToUpper() ?? "EMP_" + Guid.NewGuid().ToString().Substring(0, 8);
                                var newEmployee = new Employees
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

                                // 2. Create User
                                var newUser = new Users
                                {
                                    employee_id = newEmployee.Id,
                                    username = fbUser.Email,
                                    password_hash = "firebase",
                                    firebase_uid = fbUser.Uid,
                                    is_active = true,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                };

                                _context.Users.Add(newUser);
                                await _context.SaveChangesAsync();

                                // 3. Assign Default Role (User - ID 3)
                                var userRole = new UserRoles
                                {
                                    user_id = newUser.Id,
                                    role_id = 3, // Assuming 3 is the 'User' role as per AppDbContext seed
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
                                _logger.LogError($"Failed to sync user {fbUser.Email}: {ex.Message}");
                            }
                        }
                    }
                }
                
                _logger.LogInformation($"Sync completed. {syncCount} users synchronized.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during SyncFirebaseUsersAsync: {ex.Message}");
            }
            return syncCount;
        }

        private class FirebaseLoginResponse
        {
            public string idToken { get; set; }
            public string email { get; set; }
            public string refreshToken { get; set; }
            public string expiresIn { get; set; }
            public string localId { get; set; }
            public bool registered { get; set; }
        }
    }
}
