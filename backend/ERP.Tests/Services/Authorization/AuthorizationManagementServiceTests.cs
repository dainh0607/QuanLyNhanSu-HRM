using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using ERP.Services.Authorization;
using ERP.Repositories.Interfaces;
using ERP.Entities.Models;
using ERP.DTOs.Auth;
using ERP.Entities.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using ERP.Entities;

namespace ERP.Tests.Services.Authorization
{
    public class AuthorizationManagementServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<ICurrentUserContext> _mockUserContext;
        private readonly Mock<ILogger<AuthorizationManagementService>> _mockLogger;
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly AuthorizationManagementService _service;

        public AuthorizationManagementServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockUserContext = new Mock<ICurrentUserContext>();
            
            // Setup default tenant and user FIRST before constructor
            _mockUserContext.Setup(x => x.TenantId).Returns(1);
            _mockUserContext.Setup(x => x.UserId).Returns(100);

            _context = new AppDbContext(options, _mockUserContext.Object);

            _mockLogger = new Mock<ILogger<AuthorizationManagementService>>();
            _mockUow = new Mock<IUnitOfWork>();

            _service = new AuthorizationManagementService(
                _context,
                _mockUserContext.Object,
                _mockLogger.Object,
                _mockUow.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task CreateRoleAsync_Success()
        {
            // Arrange
            var dto = new RoleCreateUpdateDto
            {
                Name = "Khách hàng VIP",
                Description = "Nhóm khách hàng có doanh thu cao",
                IsActive = true,
                ScopeLevel = "TENANT"
            };

            // Act
            var roleId = await _service.CreateRoleAsync(dto);

            // Assert
            var roleInDb = await _context.Roles.FindAsync(roleId);
            Assert.NotNull(roleInDb);
            Assert.Equal("Khách hàng VIP", roleInDb.name);
            Assert.Equal(1, roleInDb.tenant_id);
            Assert.False(roleInDb.is_system_role);

            var scopeInDb = await _context.RoleScopes.FirstOrDefaultAsync(rs => rs.role_id == roleId);
            Assert.NotNull(scopeInDb);
            Assert.Equal("TENANT", scopeInDb.scope_level);
        }

        [Fact]
        public async Task UpdateRoleAsync_SystemRole_ThrowsException()
        {
            // Arrange
            var systemRole = new Roles
            {
                name = "System Admin",
                description = "System Role",
                is_system_role = true,
                tenant_id = 1 // or null but matching tenant
            };
            _context.Roles.Add(systemRole);
            await _context.SaveChangesAsync();

            var dto = new RoleCreateUpdateDto { Name = "Hacked Role" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.UpdateRoleAsync(systemRole.Id, dto));
            Assert.Contains("Không thể sửa nhóm quyền hệ thống", ex.Message);
        }

        [Fact]
        public async Task AssignRoleToUserAsync_Success()
        {
            // Arrange
            var user = new Users { Id = 10, username = "testuser", firebase_uid = "abc1234" };
            var role = new Roles { Id = 5, name = "Manager", description = "Mgr", tenant_id = 1 };
            _context.Users.Add(user);
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            var dto = new UserRoleAssignmentDto
            {
                UserId = 10,
                RoleId = 5,
                RegionId = 2,
                ValidFrom = DateTime.Today,
                AssignmentReason = "Test assignment"
            };

            // Act
            var result = await _service.AssignRoleToUserAsync(dto);

            // Assert
            Assert.True(result);
            var assignment = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.user_id == 10);
            Assert.NotNull(assignment);
            Assert.Equal(5, assignment.role_id);
            Assert.Equal(2, assignment.region_id);
            Assert.Equal(1, assignment.tenant_id);
            Assert.True(assignment.is_active);
        }

        [Fact]
        public async Task UpdateRolePermissionsAsync_Success()
        {
            // Arrange
            var role = new Roles { Id = 99, name = "HR", description = "HR Role", tenant_id = 1, is_system_role = false };
            var oldAction = new ActionPermissions { action = "READ", resource = "EMPLOYEE", allowed_scope = "SAME_REGION", role_id = 99, tenant_id = 1 };
            _context.Roles.Add(role);
            _context.ActionPermissions.Add(oldAction);
            await _context.SaveChangesAsync();

            var dto = new PermissionMappingDto
            {
                RoleId = 99,
                Actions = new List<ActionPermissionDto>
                {
                    new ActionPermissionDto { Action = "UPDATE", Resource = "EMPLOYEE", AllowedScope = "SAME_REGION" }
                },
                Resources = new List<ResourcePermissionDto>
                {
                    new ResourcePermissionDto { ResourceName = "Employees", ScopeLevel = "REGION" }
                }
            };

            // Act
            var result = await _service.UpdateRolePermissionsAsync(dto);

            // Assert
            Assert.True(result);
            
            var actions = await _context.ActionPermissions.Where(ap => ap.role_id == 99).ToListAsync();
            Assert.Single(actions);
            Assert.Equal("UPDATE", actions[0].action);
            Assert.Equal("SAME_REGION", actions[0].allowed_scope);

            var resources = await _context.ResourcePermissions.Where(rp => rp.role_id == 99).ToListAsync();
            Assert.Single(resources);
            Assert.Equal("REGION", resources[0].scope_level);
        }
    }
}
