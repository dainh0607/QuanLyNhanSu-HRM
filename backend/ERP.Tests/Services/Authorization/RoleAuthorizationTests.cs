using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Services.Auth;
using ERP.Services.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using Xunit.Abstractions;
using EmployeeEntity = ERP.Entities.Models.Employees;

namespace ERP.Tests.Services.Authorization
{
    public class RoleAuthorizationTests
    {
        private readonly ITestOutputHelper _output;
        private readonly Mock<ILogger<AuthService>> _mockAuthLogger = new();
        private readonly Mock<IFirebaseService> _mockFirebase = new();
        private readonly Mock<IUserService> _mockUserService = new();
        private readonly Mock<System.Net.Http.IHttpClientFactory> _mockHttpClientFactory = new();
        private readonly Mock<IConfiguration> _mockConfig = new();
        private readonly Mock<ERP.Entities.Interfaces.ICurrentUserContext> _mockUserContext = new();

        public RoleAuthorizationTests(ITestOutputHelper output)
        {
            _output = output;
            SetupConfig();
        }

        private void SetupConfig()
        {
            _mockConfig.Setup(c => c["JwtSettings:Secret"]).Returns("test_secret_key_at_least_32_characters_long");
            _mockConfig.Setup(c => c["JwtSettings:Issuer"]).Returns("NexaHRM");
            _mockConfig.Setup(c => c["JwtSettings:Audience"]).Returns("NexaHRM_Client");
            _mockConfig.Setup(c => c["JwtSettings:ExpiryInMinutes"]).Returns("60");
            _mockConfig.Setup(c => c["JwtSettings:RefreshExpiryInDays"]).Returns("7");
        }

        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            var context = new AppDbContext(options, _mockUserContext.Object);
            context.Database.EnsureCreated(); // Seeding Master Data
            return context;
        }

        private async Task SeedTenantDataAsync(AppDbContext context, int tenantId)
        {
            // Add Tenant
            context.Tenants.Add(new Tenants { Id = tenantId, name = $"Tenant {tenantId}", code = $"T{tenantId}", is_active = true });
            
            // Add Branch for this tenant
            context.Branches.Add(new Branches { Id = tenantId * 10, name = $"Branch {tenantId}", tenant_id = tenantId, region_id = 1, code = $"BR{tenantId}" });

            // Add Employees for this tenant (10 employees)
            for (int i = 1; i <= 10; i++)
            {
                context.Employees.Add(new EmployeeEntity
                {
                    Id = tenantId * 100 + i,
                    tenant_id = tenantId,
                    employee_code = $"EMP-{tenantId}-{i:D3}",
                    full_name = $"Employee {i} of T{tenantId}",
                    email = $"emp{i}@t{tenantId}.com",
                    branch_id = tenantId * 10,
                    is_active = true
                });
            }

            await context.SaveChangesAsync();
        }

        private async Task<Users> SetupUserWithRoleAsync(AppDbContext context, int tenantId, int roleId, int? branchId = null)
        {
            int userId = tenantId * 1000 + roleId;
            int employeeId = tenantId * 100 + roleId; // Use one of the seeded employees

            var user = new Users
            {
                Id = userId,
                username = $"user_{roleId}@t{tenantId}.com",
                firebase_uid = $"uid_{userId}",
                tenant_id = tenantId,
                employee_id = employeeId,
                is_active = true
            };
            context.Users.Add(user);

            context.UserRoles.Add(new UserRoles
            {
                user_id = userId,
                role_id = roleId,
                tenant_id = tenantId,
                branch_id = branchId,
                is_active = true,
                assignment_reason = "Test"
            });

            await context.SaveChangesAsync();
            return user;
        }

        [Theory]
        [InlineData(1, "TENANT", true)]  // SuperAdmin
        [InlineData(2, "TENANT", true)]  // Manager
        [InlineData(4, "BRANCH", false)] // Branch Manager
        [InlineData(7, "PERSONAL", false)] // Staff
        public async Task Authorization_RoleScopeResolution_Correct(int roleId, string expectedScope, bool expectedUnrestricted)
        {
            // Arrange
            int tenantId = 100;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            var context = GetDbContext();
            await SeedTenantDataAsync(context, tenantId);
            var user = await SetupUserWithRoleAsync(context, tenantId, roleId, roleId == 4 ? tenantId * 10 : null);

            var scopedHelper = new ScopedQueryHelper(context);

            // Act
            var scopeInfo = await scopedHelper.GetUserScopeInfo(user.Id, tenantId);

            // Assert
            _output.WriteLine($"Role {roleId} -> Scope: {scopeInfo.ScopeLevel}, HasUnrestrictedAccess: {scopeInfo.HasUnrestrictedAccess}");
            Assert.Equal(expectedScope, scopeInfo.ScopeLevel);
            Assert.Equal(expectedUnrestricted, scopeInfo.HasUnrestrictedAccess);
        }

        [Theory]
        [InlineData(2, 10)] // Manager sees all 10 employees in tenant
        [InlineData(7, 1)]  // Staff sees only 1 (themselves)
        public async Task ScopedQueryHelper_ApplyEmployeeScopeFilter_CorrectResults(int roleId, int expectedCount)
        {
            // Arrange
            int tenantId = 200;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);
            
            var context = GetDbContext();
            await SeedTenantDataAsync(context, tenantId);
            var user = await SetupUserWithRoleAsync(context, tenantId, roleId);

            var scopedHelper = new ScopedQueryHelper(context);
            var query = context.Employees.AsQueryable();

            // Act
            var filteredQuery = await scopedHelper.ApplyEmployeeScopeFilter(query, user.Id, tenantId);
            var results = await filteredQuery.ToListAsync();

            // Assert
            _output.WriteLine($"Role {roleId} in Tenant {tenantId} sees {results.Count} employees");
            Assert.Equal(expectedCount, results.Count);
            
            if (roleId == 7)
            {
                Assert.Equal(user.employee_id, results.First().Id);
            }
        }

        [Fact]
        public async Task LoginAsync_Manager_ReturnsCorrectTenantIdInToken()
        {
            // Arrange
            int tenantId = 300;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            var context = GetDbContext();
            await SeedTenantDataAsync(context, tenantId);
            var user = await SetupUserWithRoleAsync(context, tenantId, 2); // Manager

            _mockFirebase.Setup(f => f.SignInWithPasswordAsync(user.username, "password"))
                .ReturnsAsync((true, "id_token", "refresh_token", 3600, user.firebase_uid, user.username, null));

            var authService = new AuthService(context, _mockAuthLogger.Object, _mockConfig.Object, _mockFirebase.Object, _mockUserService.Object, _mockHttpClientFactory.Object);

            var loginDto = new LoginDto { Email = user.username, Password = "password" };
            var sessionContext = new AuthSessionContextDto { ResolvedTenantId = tenantId };

            // Act
            var result = await authService.LoginAsync(loginDto, sessionContext);

            // Assert
            Assert.True(result.Success);
            Assert.Equal(tenantId, result.User.TenantId);
            Assert.Contains("Manager", result.User.Roles);
            _output.WriteLine($"Login success for Manager in Tenant {result.User.TenantId}");
        }
    }
}
