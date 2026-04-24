using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using ERP.Services.Authorization;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ERP.Tests.Services.Authorization
{
    public class PermissionMatrixServiceTests
    {
        private readonly Mock<ICurrentUserContext> _mockUserContext;
        private readonly AppDbContext _context;
        private readonly PermissionMatrixService _service;

        public PermissionMatrixServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockUserContext = new Mock<ICurrentUserContext>();
            _mockUserContext.Setup(u => u.TenantId).Returns(1);

            _context = new AppDbContext(options, _mockUserContext.Object);
            _service = new PermissionMatrixService(_context, _mockUserContext.Object);
        }

        [Fact]
        public async Task GetMatrixByModuleAsync_ReturnsCorrectStructure()
        {
            // Arrange
            _context.Roles.Add(new Roles { Id = 1, name = "Manager", tenant_id = 1 });
            _context.Roles.Add(new Roles { Id = 2, name = "Admin", tenant_id = 1 });
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetMatrixByModuleAsync("EMPLOYEES");

            // Assert
            Assert.Equal("EMPLOYEES", result.ModuleCode);
            Assert.Contains(result.Features, f => f.Code == "EMPLOYEE_CREATE");
            Assert.Contains(result.Roles, r => r.Name == "Manager");
            Assert.Contains(result.Roles, r => r.Name == "Admin");
            
            // Admin should be granted by default
            var adminCreate = result.PermissionValues.First(v => v.RoleId == 2 && v.FeatureCode == "EMPLOYEE_CREATE");
            Assert.True(adminCreate.IsGranted);
        }

        [Fact]
        public async Task GetMatrixByModuleAsync_ThrowsOnInvalidModule()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _service.GetMatrixByModuleAsync("INVALID_MODULE"));
        }

        [Fact]
        public async Task UpdateMatrixAsync_UpdatesPermissionsSuccessfully()
        {
            // Arrange
            _context.Roles.Add(new Roles { Id = 1, name = "Manager", tenant_id = 1 });
            await _context.SaveChangesAsync();

            var updateDto = new PermissionMatrixUpdateDto
            {
                ModuleCode = "EMPLOYEES",
                PermissionValues = new List<FeaturePermissionValueDto>
                {
                    new FeaturePermissionValueDto { RoleId = 1, FeatureCode = "EMPLOYEE_CREATE", IsGranted = true },
                    new FeaturePermissionValueDto { RoleId = 1, FeatureCode = "EMPLOYEE_DELETE", IsGranted = false }
                }
            };

            // Act
            var result = await _service.UpdateMatrixAsync(updateDto);

            // Assert
            Assert.True(result);
            var perms = await _context.FeaturePermissions.Where(p => p.role_id == 1).ToListAsync();
            Assert.Equal(2, perms.Count);
            Assert.True(perms.First(p => p.feature_code == "EMPLOYEE_CREATE").is_granted);
            Assert.False(perms.First(p => p.feature_code == "EMPLOYEE_DELETE").is_granted);
        }

        [Fact]
        public async Task UpdateMatrixAsync_ProtectsAdminPermissions()
        {
            // Arrange
            _context.Roles.Add(new Roles { Id = 2, name = "Admin", tenant_id = 1 });
            await _context.SaveChangesAsync();

            var updateDto = new PermissionMatrixUpdateDto
            {
                ModuleCode = "EMPLOYEES",
                PermissionValues = new List<FeaturePermissionValueDto>
                {
                    // Attempt to revoke admin permission
                    new FeaturePermissionValueDto { RoleId = 2, FeatureCode = "EMPLOYEE_CREATE", IsGranted = false }
                }
            };

            // Act
            await _service.UpdateMatrixAsync(updateDto);

            // Assert
            var adminPerm = await _context.FeaturePermissions
                .FirstOrDefaultAsync(p => p.role_id == 2 && p.feature_code == "EMPLOYEE_CREATE");
            
            // Should not even create a record for admin if it's always true, 
            // OR if it exists, it should not be false.
            if (adminPerm != null)
            {
                Assert.True(adminPerm.is_granted);
            }
        }

        [Fact]
        public async Task GetMatrixByModuleAsync_HandlesExistingPermissions()
        {
            // Arrange
            _context.Roles.Add(new Roles { Id = 3, name = "Staff", tenant_id = 1 });
            _context.FeaturePermissions.Add(new FeaturePermissions 
            { 
                tenant_id = 1, 
                role_id = 3, 
                feature_code = "EMPLOYEE_VIEW", 
                is_granted = true 
            });
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetMatrixByModuleAsync("EMPLOYEES");

            // Assert
            var staffView = result.PermissionValues.First(v => v.RoleId == 3 && v.FeatureCode == "EMPLOYEE_VIEW");
            Assert.True(staffView.IsGranted);
        }
    }
}
