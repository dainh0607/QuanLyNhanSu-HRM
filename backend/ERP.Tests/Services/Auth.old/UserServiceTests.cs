using System;
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

namespace ERP.Tests.Services.Auth
{
    public class UserServiceTests
    {
        private readonly Mock<ERP.Entities.Interfaces.ICurrentUserContext> _mockUserContext = new();
        private readonly Mock<ILogger<UserService>> _mockLogger = new();
        private readonly Mock<IFirebaseService> _mockFirebase = new();
        private readonly Mock<IConfiguration> _mockConfiguration = new();

        private AppDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new AppDbContext(options, _mockUserContext.Object);
        }

        [Fact]
        public async Task AssignRoleAsync_FallsBackToLegacyAdminRole_WhenCanonicalAdminIdMissing()
        {
            using var context = CreateDbContext();
            var now = DateTime.UtcNow;

            context.Employees.Add(new Employees
            {
                Id = 1,
                employee_code = "EMP001",
                full_name = "Legacy Admin",
                email = "legacy-admin@example.com",
                tenant_id = 1,
                is_active = true,
                CreatedAt = now,
                UpdatedAt = now
            });

            context.Users.Add(new Users
            {
                Id = 10,
                employee_id = 1,
                username = "legacy-admin@example.com",
                firebase_uid = "legacy-admin-uid",
                tenant_id = 1,
                is_active = true,
                CreatedAt = now,
                UpdatedAt = now
            });

            context.Roles.Add(new Roles
            {
                Id = 1,
                name = AuthSecurityConstants.RoleAdmin,
                description = "Legacy Admin",
                is_active = true,
                is_system_role = true,
                CreatedAt = now,
                UpdatedAt = now
            });

            await context.SaveChangesAsync();

            var service = new UserService(context, _mockLogger.Object, _mockFirebase.Object, _mockConfiguration.Object);

            await service.AssignRoleAsync(10, AuthSecurityConstants.RoleAdminId, 1, "Legacy fallback");

            var assignment = await context.UserRoles.SingleAsync();

            Assert.Equal(1, assignment.role_id);
        }

        [Fact]
        public async Task AssignRoleAsync_CreatesCanonicalAdminRoleAndScope_WhenRoleIsMissing()
        {
            using var context = CreateDbContext();
            var now = DateTime.UtcNow;

            context.Employees.Add(new Employees
            {
                Id = 2,
                employee_code = "EMP002",
                full_name = "Workspace Owner",
                email = "owner@example.com",
                tenant_id = 1,
                is_active = true,
                CreatedAt = now,
                UpdatedAt = now
            });

            context.Users.Add(new Users
            {
                Id = 20,
                employee_id = 2,
                username = "owner@example.com",
                firebase_uid = "owner-uid",
                tenant_id = 1,
                is_active = true,
                CreatedAt = now,
                UpdatedAt = now
            });

            await context.SaveChangesAsync();

            var service = new UserService(context, _mockLogger.Object, _mockFirebase.Object, _mockConfiguration.Object);

            await service.AssignRoleAsync(20, AuthSecurityConstants.RoleAdminId, 1, "Create canonical admin");

            var role = await context.Roles.SingleAsync();
            var assignment = await context.UserRoles.SingleAsync();
            var scope = await context.RoleScopes.SingleAsync();

            Assert.Equal(AuthSecurityConstants.RoleAdminId, role.Id);
            Assert.Equal(AuthSecurityConstants.RoleAdmin, role.name);
            Assert.Equal(role.Id, assignment.role_id);
            Assert.Equal(role.Id, scope.role_id);
            Assert.Equal("TENANT", scope.scope_level);
        }
    }
}
