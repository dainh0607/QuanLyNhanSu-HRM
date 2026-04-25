using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using ERP.Services.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ERP.Tests.Services.Authorization
{
    public class FeatureGateTests
    {
        private readonly Mock<ICurrentUserContext> _mockUserContext;
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly AppDbContext _context;
        private readonly AuthorizationService _authService;
        private readonly Mock<ILogger<AuthorizationService>> _mockLogger;

        public FeatureGateTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockUserContext = new Mock<ICurrentUserContext>();
            _mockUserContext.Setup(u => u.TenantId).Returns(1);

            _context = new AppDbContext(options, _mockUserContext.Object);
            _mockUow = new Mock<IUnitOfWork>();
            _mockLogger = new Mock<ILogger<AuthorizationService>>();
            _authService = new AuthorizationService(_context, _mockUow.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task CanPerformAction_ReturnsFalse_WhenFeatureIsDisabled()
        {
            // Arrange
            int userId = 10;
            int roleId = 7; // Staff
            
            var roleObj = new Roles { Id = roleId, name = "Staff" };
            _context.Users.Add(new Users { Id = userId, username = "testuser", firebase_uid = "fb-10" });
            _context.Roles.Add(roleObj);
            _context.UserRoles.Add(new UserRoles { user_id = userId, role_id = roleId, Role = roleObj, is_active = true });
            
            // Explicitly disable the feature for this role
            _context.FeaturePermissions.Add(new FeaturePermissions 
            { 
                role_id = roleId, 
                feature_code = "EMPLOYEE_CREATE", 
                is_granted = false 
            });

            // Even if fine-grained ActionPermissions exists
            _context.ActionPermissions.Add(new ActionPermissions 
            { 
                role_id = roleId, 
                action = "create", 
                resource = "employee", 
                allowed_scope = "SAME_TENANT",
                is_active = true 
            });

            await _context.SaveChangesAsync();

            // Act
            var result = await _authService.CanPerformAction(userId, "create", "employee");

            // Assert
            Assert.False(result); // Should be blocked by feature gate
        }

        [Fact]
        public async Task CanPerformAction_ReturnsTrue_WhenFeatureIsAlwaysEnabledForAdmin()
        {
            // Arrange
            int userId = 1;
            int roleId = 8; // Admin
            
            var adminRole = new Roles { Id = roleId, name = "Admin" };
            _context.Users.Add(new Users { Id = userId, username = "admin", firebase_uid = "fb-admin" });
            _context.Roles.Add(adminRole);
            _context.UserRoles.Add(new UserRoles { user_id = userId, role_id = roleId, Role = adminRole, is_active = true });
            
            await _context.SaveChangesAsync();

            // Act
            var result = await _authService.CanPerformAction(userId, "create", "employee");

            // Assert
            Assert.True(result); // Admin bypass
        }
    }
}
