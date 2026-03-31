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

namespace ERP.Services.Auth
{
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
            IFirebaseService firebaseService,
            IUserService userService)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _firebaseService = firebaseService;
            _userService = userService;
        }

        public async Task<AuthResponseDto> SignUpAsync(SignUpDto dto)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // 1. Check local email/employee existence
                    var existingEmployee = await _context.Employees
                        .FirstOrDefaultAsync(e => e.email == dto.Email || e.employee_code == dto.EmployeeCode);

                    if (existingEmployee != null)
                    {
                        var existingUser = await _context.Users
                            .FirstOrDefaultAsync(u => u.employee_id == existingEmployee.Id);

                        if (existingUser != null)
                        {
                            return new AuthResponseDto { Success = false, Message = "Email hoặc mã nhân viên đã được đăng ký" };
                        }
                    }

                    // 2. Create Firebase User
                    var userArgs = new UserRecordArgs()
                    {
                        Email = dto.Email,
                        Password = dto.Password,
                        DisplayName = dto.FullName,
                        PhoneNumber = dto.PhoneNumber,
                        Disabled = false,
                    };
                    var firebaseUser = await _firebaseService.CreateUserAsync(userArgs);

                    try
                    {
                        // 3. Create/Update Local Employee
                        if (existingEmployee == null)
                        {
                            existingEmployee = new ERP.Entities.Models.Employees
                            {
                                employee_code = dto.EmployeeCode,
                                full_name = dto.FullName,
                                email = dto.Email,
                                phone = dto.PhoneNumber,
                                is_active = true,
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };
                            _context.Employees.Add(existingEmployee);
                            await _context.SaveChangesAsync();
                        }

                        // 4. Create Local User
                        var user = await _userService.CreateLocalUserAsync(existingEmployee.Id, dto.Email, firebaseUser.Uid);

                        // 5. Assign Roles
                        int assignedRoleId = 3; // Default User
                        string masterEmail = _configuration["AdminSettings:MasterEmail"];

                        if (!string.IsNullOrEmpty(masterEmail) && 
                            string.Equals(dto.Email, masterEmail, StringComparison.OrdinalIgnoreCase))
                        {
                            assignedRoleId = 1; // Admin
                        }
                        
                        await _userService.AssignRoleAsync(user.Id, assignedRoleId);
                        await transaction.CommitAsync();

                        return new AuthResponseDto
                        {
                            Success = true,
                            Message = "Đăng ký thành công",
                            User = await _userService.GetByIdAsync(user.Id)
                        };
                    }
                    catch (Exception)
                    {
                        // Rollback Firebase user if local local processing fails
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
                        throw; // Rethrow to outer catch
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Error in SignUpAsync: {ex.Message}");
                    return new AuthResponseDto { Success = false, Message = "Lỗi trong quá trình đăng ký" };
                }
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            try
            {
                var fbResult = await _firebaseService.SignInWithPasswordAsync(dto.Email, dto.Password);
                if (!fbResult.Success)
                    return new AuthResponseDto { Success = false, Message = fbResult.Message };

                var userInfo = await _userService.GetByUidAsync(await _firebaseService.VerifyIdTokenAsync(fbResult.IdToken));
                if (userInfo == null)
                    return new AuthResponseDto { Success = false, Message = "Tài khoản không được tìm thấy hệ thống" };

                var internalToken = GenerateInternalToken(userInfo);

                return new AuthResponseDto
                {
                    Success = true,
                    Message = "Đăng nhập thành công",
                    IdToken = internalToken,
                    RefreshToken = fbResult.RefreshToken,
                    ExpiresIn = int.Parse(_configuration["JwtSettings:ExpiryInMinutes"] ?? "1440") * 60,
                    User = userInfo
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in LoginAsync: {ex.Message}");
                return new AuthResponseDto { Success = false, Message = "Lỗi đăng nhập" };
            }
        }

        public async Task<AuthResponseDto> PreRegisterStaffAsync(PreRegisterStaffDto dto)
        {
            try
            {
                var existingEmployee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.email == dto.Email);

                if (existingEmployee != null)
                    return new AuthResponseDto { Success = false, Message = "Email đã tồn tại" };

                var employee = new ERP.Entities.Models.Employees
                {
                    employee_code = dto.EmployeeCode ?? "STAFF_" + Guid.NewGuid().ToString().Substring(0, 8),
                    full_name = dto.FullName,
                    email = dto.Email,
                    is_active = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                return new AuthResponseDto { Success = true, Message = "Cấp quyền thành công" };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in PreRegisterStaffAsync");
                return new AuthResponseDto { Success = false, Message = "Lỗi cấp quyền" };
            }
        }

        public string GenerateInternalToken(UserInfoDto user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim("EmployeeId", user.EmployeeId.ToString()),
                new Claim("EmployeeCode", user.EmployeeCode ?? "")
            };

            foreach (var role in user.Roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JwtSettings:ExpiryInMinutes"] ?? "1440"));

            var token = new JwtSecurityToken(
                _configuration["JwtSettings:Issuer"],
                _configuration["JwtSettings:Audience"],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
