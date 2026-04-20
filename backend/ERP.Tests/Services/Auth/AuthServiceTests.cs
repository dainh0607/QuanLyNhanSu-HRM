using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Services.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using Xunit.Abstractions;

namespace ERP.Tests.Services.Auth
{
    public class AuthServiceTests
    {
        private readonly ITestOutputHelper _output;
        private readonly Mock<ILogger<AuthService>> _mockLogger = new();
        private readonly Mock<IFirebaseService> _mockFirebase = new();
        private readonly Mock<IUserService> _mockUserService = new();
        private readonly Mock<IHttpClientFactory> _mockHttpClientFactory = new();
        private readonly Mock<IConfiguration> _mockConfig = new();
        private readonly Mock<ERP.Entities.Interfaces.ICurrentUserContext> _mockUserContext = new();

        public AuthServiceTests(ITestOutputHelper output)
        {
            _output = output;
        }

        private AppDbContext GetRawDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options, _mockUserContext.Object);
        }

        private async Task<AppDbContext> GetDbContextWithRolesAsync()
        {
            _mockUserContext.Setup(c => c.TenantId).Returns(1);
            var context = GetRawDbContext();
            
            // Apply Master Data seeding defined in OnModelCreating
            await context.Database.EnsureCreatedAsync();

            // Seed a Tenant (since it might not be in SeedMasterData)
            if (!await context.Tenants.AnyAsync(t => t.Id == 1))
            {
                context.Tenants.Add(new Tenants { Id = 1, name = "Test Tenant", code = "TEST", is_active = true });
                await context.SaveChangesAsync();
            }
            
            return context;
        }

        private void SetupConfig()
        {
            _mockConfig.Setup(c => c["AdminSettings:MasterEmail"]).Returns("admin@nexahrm.com");
            _mockConfig.Setup(c => c["JwtSettings:Secret"]).Returns("test_secret_key_at_least_32_characters_long");
            _mockConfig.Setup(c => c["JwtSettings:Issuer"]).Returns("NexaHRM");
            _mockConfig.Setup(c => c["JwtSettings:Audience"]).Returns("NexaHRM_Client");
            _mockConfig.Setup(c => c["JwtSettings:ExpiryInMinutes"]).Returns("60");
            _mockConfig.Setup(c => c["JwtSettings:RefreshExpiryInDays"]).Returns("7");
        }

        [Theory]
        [InlineData(1, AuthSecurityConstants.RoleAdmin, true)]
        [InlineData(2, AuthSecurityConstants.RoleDirector, true)]
        [InlineData(3, AuthSecurityConstants.RoleRegionManager, true)]
        [InlineData(4, AuthSecurityConstants.RoleBranchManager, true)]
        [InlineData(5, AuthSecurityConstants.RoleDeptManager, true)]
        [InlineData(6, AuthSecurityConstants.RoleModuleAdmin, true)]
        [InlineData(7, AuthSecurityConstants.RoleEmployee, false)] // Staff should be blocked from management
        public async Task LoginAsync_RoleValidation_ReturnsExpectedResult(int roleId, string roleName, bool expectedSuccess)
        {
            // Arrange
            var context = await GetDbContextWithRolesAsync();
            SetupConfig();
            _mockUserContext.Setup(c => c.TenantId).Returns(1);

            var email = $"test_{roleName.Replace(" ", "_")}@example.com";
            var uid = $"uid_{roleId}";

            try
            {
                // Setup local user and employee
                var employee = new ERP.Entities.Models.Employees 
                { 
                    Id = roleId, 
                    email = email, 
                    full_name = $"User {roleName}", 
                    tenant_id = 1,
                    employee_code = $"EMP{roleId:D3}", // Required field
                    is_active = true
                };
                context.Employees.Add(employee);
                
                var user = new Users { Id = roleId, username = email, firebase_uid = uid, employee_id = employee.Id, tenant_id = 1, is_active = true };
                context.Users.Add(user);
                
                context.UserRoles.Add(new UserRoles 
                { 
                    user_id = user.Id, 
                    role_id = roleId, 
                    is_active = true, 
                    tenant_id = 1,
                    assignment_reason = "Test Assignment" // Required field
                });
                await context.SaveChangesAsync();

                // Mock Firebase Success
                _mockFirebase.Setup(f => f.SignInWithPasswordAsync(email, "password123"))
                    .ReturnsAsync((true, "id_token", "refresh_token", 3600, uid, email, null));

                var authService = new AuthService(context, _mockLogger.Object, _mockConfig.Object, _mockFirebase.Object, _mockUserService.Object, _mockHttpClientFactory.Object);
                
                var loginDto = new LoginDto { Email = email, Password = "password123" };
                var sessionContext = new AuthSessionContextDto { IpAddress = "127.0.0.1", UserAgent = "TestAgent" };

                // Act
                var result = await authService.LoginAsync(loginDto, sessionContext);

                // Assert
                Assert.True(expectedSuccess == result.Success, $"Expected Success={expectedSuccess} but got {result.Success}. Message: {result.Message}");
                if (!expectedSuccess)
                {
                    Assert.Contains("permission", result.Message, StringComparison.OrdinalIgnoreCase);
                }
                else
                {
                    Assert.NotNull(result.IdToken);
                    Assert.Equal(roleName, result.User.Roles.First());
                }
            }
            catch (Exception ex)
            {
                _output.WriteLine($"Test failed: {ex.Message}");
                if (ex.InnerException != null) _output.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                throw;
            }
        }

        [Fact]
        public async Task LoginAsync_WrongCredentials_ReturnsFailure()
        {
            // Arrange
            var context = await GetDbContextWithRolesAsync();
            SetupConfig();
            
            var email = "wrong@example.com";
            _mockFirebase.Setup(f => f.SignInWithPasswordAsync(email, "wrongpass"))
                .ReturnsAsync((false, null, null, null, null, null, "INVALID_PASSWORD"));

            var authService = new AuthService(context, _mockLogger.Object, _mockConfig.Object, _mockFirebase.Object, _mockUserService.Object, _mockHttpClientFactory.Object);
            
            var loginDto = new LoginDto { Email = email, Password = "wrongpass" };

            // Act
            var result = await authService.LoginAsync(loginDto, new AuthSessionContextDto());

            // Assert
            Assert.False(result.Success);
            Assert.Equal("INVALID_PASSWORD", result.Message);
        }

        [Fact]
        public async Task LoginAsync_UserNotSynced_ReturnsSyncMessage()
        {
            // Arrange
            var context = await GetDbContextWithRolesAsync();
            SetupConfig();
            
            var email = "unsynced@example.com";
            var uid = "bypass:unsynced_uid"; // Use bypass to avoid auto-provisioning
            
            _mockFirebase.Setup(f => f.SignInWithPasswordAsync(email, "password123"))
                .ReturnsAsync((true, "token", "refresh", 3600, uid, email, null));

            // No local user record
            
            var authService = new AuthService(context, _mockLogger.Object, _mockConfig.Object, _mockFirebase.Object, _mockUserService.Object, _mockHttpClientFactory.Object);

            // Act
            var result = await authService.LoginAsync(new LoginDto { Email = email, Password = "password123" }, new AuthSessionContextDto());

            // Assert
            Assert.False(result.Success, $"Expected failure but got success with user: {result.User?.Email}");
            Assert.Contains("dong bo", result.Message);
        }
    }
}
