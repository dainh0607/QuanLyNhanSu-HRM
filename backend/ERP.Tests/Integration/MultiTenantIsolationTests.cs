using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Entities.Interfaces;
using ERP.Services.Authorization;
using Microsoft.Extensions.Logging;
using ERP.Repositories.Interfaces;

namespace ERP.Tests.Integration
{
    public class MultiTenantIsolationTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<ICurrentUserContext> _mockUserContext;
        private readonly Mock<ILogger<AuthorizationManagementService>> _mockLogger;
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly AuthorizationManagementService _service;
        
        private const int TenantA = 10;
        private const int TenantB = 20;

        public MultiTenantIsolationTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockUserContext = new Mock<ICurrentUserContext>();
            _mockLogger = new Mock<ILogger<AuthorizationManagementService>>();
            _mockUow = new Mock<IUnitOfWork>();

            // Initial context with Tenant A
            _mockUserContext.Setup(x => x.TenantId).Returns(TenantA);
            _mockUserContext.Setup(x => x.IsSystemAdmin).Returns(false);

            _context = new AppDbContext(options, _mockUserContext.Object);
            
            _service = new AuthorizationManagementService(
                _context,
                _mockUserContext.Object,
                _mockLogger.Object,
                _mockUow.Object);

            SeedData().Wait();
        }

        private async Task SeedData()
        {
            // Seed Tenant A Data
            _context.Roles.Add(new Roles { Id = 1, name = "RoleA", tenant_id = TenantA });
            _context.Employees.Add(new Employees { Id = 1, full_name = "EmpA", tenant_id = TenantA, branch_id = 1 });

            // Seed Tenant B Data
            _context.Roles.Add(new Roles { Id = 2, name = "RoleB", tenant_id = TenantB });
            _context.Employees.Add(new Employees { Id = 2, full_name = "EmpB", tenant_id = TenantB, branch_id = 2 });

            await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task TC1_6_1_GetRoles_TenantA_ReturnsOnlyTenantARoles()
        {
            // Arrange - context is already Tenant A
            
            // Act
            var roles = await _context.Roles.ToListAsync();

            // Assert
            Assert.Contains(roles, r => r.tenant_id == TenantA);
            Assert.DoesNotContain(roles, r => r.tenant_id == TenantB);
        }

        [Fact]
        public async Task TC1_6_2_TenantB_CannotAccessTenantAData()
        {
            // Arrange - Switch to Tenant B
            _mockUserContext.Setup(x => x.TenantId).Returns(TenantB);

            // Act
            var roles = await _context.Roles.ToListAsync();
            var employees = await _context.Employees.ToListAsync();

            // Assert
            Assert.All(roles, r => Assert.Equal(TenantB, r.tenant_id));
            Assert.All(employees, e => Assert.Equal(TenantB, e.tenant_id));
            Assert.DoesNotContain(roles, r => r.tenant_id == TenantA);
        }

        [Fact]
        public async Task TC1_6_3_SaveChanges_AutoAssignsCurrentTenantId()
        {
            // Arrange
            _mockUserContext.Setup(x => x.TenantId).Returns(TenantA);
            var newRole = new Roles { name = "NewRoleA" }; // No tenant_id set

            // Act
            _context.Roles.Add(newRole);
            await _context.SaveChangesAsync();

            // Assert
            Assert.Equal(TenantA, newRole.tenant_id);
        }

        [Fact]
        public async Task TC1_6_4_SystemAdmin_CanSeeAllTenants()
        {
            // Arrange
            _mockUserContext.Setup(x => x.IsSystemAdmin).Returns(true);
            _mockUserContext.Setup(x => x.TenantId).Returns((int?)null);

            // Act
            var allRoles = await _context.Roles.ToListAsync();

            // Assert
            Assert.Contains(allRoles, r => r.tenant_id == TenantA);
            Assert.Contains(allRoles, r => r.tenant_id == TenantB);
        }

        [Fact]
        public async Task TC1_6_5_CrossTenantUpdate_IsPreventedByQueryFilter()
        {
            // Arrange - Switch to Tenant B
            _mockUserContext.Setup(x => x.TenantId).Returns(TenantB);

            // Act
            // Try to find a Tenant A role while in Tenant B context
            var roleA = await _context.Roles.FirstOrDefaultAsync(r => r.Id == 1);

            // Assert
            Assert.Null(roleA);
        }
    }
}
