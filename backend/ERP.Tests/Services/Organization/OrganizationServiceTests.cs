using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Branches;
using ERP.DTOs.Departments;
using ERP.DTOs.JobTitles;
using ERP.DTOs.Regions;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using ERP.Services.Organization;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ERP.Tests.Services.Organization
{
    public class OrganizationServiceTests
    {
        private readonly Mock<ICurrentUserContext> _mockUserContext = new();

        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options, _mockUserContext.Object);
        }

        [Fact]
        public async Task GetPagedRegionsAsync_ReturnsCorrectItems_WithSearch()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.Regions.AddRange(new List<Regions>
            {
                new Regions { Id = 1, tenant_id = tenantId, name = "North", code = "NORTH" },
                new Regions { Id = 2, tenant_id = tenantId, name = "South", code = "SOUTH" },
                new Regions { Id = 3, tenant_id = tenantId, name = "East", code = "EAST" }
            });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);

            // Act
            var result = await service.GetPagedRegionsAsync(1, 10, "North");

            // Assert
            Assert.Single(result.Items);
            Assert.Equal("North", result.Items.First().Name);
        }

        [Fact]
        public async Task CreateBranchAsync_Throws_WhenCodeDuplicate()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.Branches.Add(new Branches { Id = 1, tenant_id = tenantId, name = "Old Branch", code = "B01" });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);
            var dto = new BranchCreateDto { Name = "New Branch", Code = "B01" };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => service.CreateBranchAsync(dto));
        }

        [Fact]
        public async Task DeleteRegionAsync_Throws_WhenHasBranches()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.Regions.Add(new Regions { Id = 1, tenant_id = tenantId, name = "Region", code = "R1" });
            context.Branches.Add(new Branches { Id = 1, tenant_id = tenantId, name = "Branch", code = "B1", region_id = 1 });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteRegionAsync(1));
            Assert.Contains("chi nhánh trực thuộc", ex.Message);
        }

        [Fact]
        public async Task DeleteBranchAsync_Throws_WhenHasEmployees()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.Branches.Add(new Branches { Id = 1, tenant_id = tenantId, name = "Branch", code = "B1" });
            context.Employees.Add(new ERP.Entities.Models.Employees { Id = 1, tenant_id = tenantId, branch_id = 1, employee_code = "EMP01" });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteBranchAsync(1));
            Assert.Contains("nhân viên", ex.Message);
        }

        [Fact]
        public async Task DeleteDepartmentAsync_Throws_WhenHasSubDepartments()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.Departments.Add(new Departments { Id = 1, tenant_id = tenantId, name = "Parent", code = "D1" });
            context.Departments.Add(new Departments { Id = 2, tenant_id = tenantId, name = "Child", code = "D2", parent_id = 1 });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteDepartmentAsync(1));
            Assert.Contains("phòng ban cấp con", ex.Message);
        }

        [Fact]
        public async Task UpdateBranchAsync_Throws_WhenCircularDependency_Direct()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.Branches.Add(new Branches { Id = 1, tenant_id = tenantId, name = "B1", code = "B1" });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);
            var dto = new BranchUpdateDto { Name = "B1 Update", Code = "B1", ParentId = 1 };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateBranchAsync(1, dto));
            Assert.Contains("cha của chính nó", ex.Message);
        }

        [Fact]
        public async Task UpdateBranchAsync_Throws_WhenCircularDependency_Indirect()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            // A -> B -> C
            context.Branches.Add(new Branches { Id = 1, tenant_id = tenantId, name = "A", code = "A" });
            context.Branches.Add(new Branches { Id = 2, tenant_id = tenantId, name = "B", code = "B", parent_id = 1 });
            context.Branches.Add(new Branches { Id = 3, tenant_id = tenantId, name = "C", code = "C", parent_id = 2 });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);
            
            // Try to make A a child of C (C -> A) => A -> B -> C -> A (Loop)
            var dto = new BranchUpdateDto { Name = "A Update", Code = "A", ParentId = 3 };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateBranchAsync(1, dto));
            Assert.Contains("vòng lặp", ex.Message);
        }

        [Fact]
        public async Task DeleteBranchAsync_Throws_WhenHasSubBranches()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.Branches.Add(new Branches { Id = 1, tenant_id = tenantId, name = "Parent", code = "P1" });
            context.Branches.Add(new Branches { Id = 2, tenant_id = tenantId, name = "Child", code = "C1", parent_id = 1 });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteBranchAsync(1));
            Assert.Contains("chi nhánh con trực thuộc", ex.Message);
        }

        [Fact]
        public async Task CreateDepartment_SetsParentNull_WhenIsHeadDepartment()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            var service = new OrganizationService(context, _mockUserContext.Object);
            var dto = new DepartmentCreateDto 
            { 
                Name = "HQ", 
                Code = "HQ", 
                IsHeadDepartment = true, 
                ParentId = 5 // Should be ignored
            };

            // Act
            var result = await service.CreateDepartmentAsync(dto);

            // Assert
            Assert.Null(result.ParentId);
            Assert.True(result.IsHeadDepartment);
        }

        [Fact]
        public async Task UpdateDepartment_Throws_WhenCircularDependency()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.Departments.Add(new Departments { Id = 1, tenant_id = tenantId, name = "D1", code = "D1" });
            context.Departments.Add(new Departments { Id = 2, tenant_id = tenantId, name = "D2", code = "D2", parent_id = 1 });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);
            
            // Try to make D1 a child of D2
            var dto = new DepartmentUpdateDto { Name = "D1", Code = "D1", ParentId = 2 };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateDepartmentAsync(1, dto));
            Assert.Contains("vòng lặp", ex.Message);
        }

        [Fact]
        public async Task DeleteDepartment_Throws_WhenHasEmployees()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.Departments.Add(new Departments { Id = 1, tenant_id = tenantId, name = "D1", code = "D1" });
            context.Employees.Add(new ERP.Entities.Models.Employees { Id = 1, tenant_id = tenantId, department_id = 1, employee_code = "E1" });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteDepartmentAsync(1));
            Assert.Contains("nhân viên trực thuộc", ex.Message);
        }

        [Fact]
        public async Task UpdateJobTitle_Throws_WhenCircularDependency()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.JobTitles.Add(new JobTitles { Id = 1, tenant_id = tenantId, name = "Manager", code = "MGR" });
            context.JobTitles.Add(new JobTitles { Id = 2, tenant_id = tenantId, name = "Staff", code = "STAFF", parent_id = 1 });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);
            
            // Try to make Manager report to Staff
            var dto = new JobTitleUpdateDto { Name = "Manager", Code = "MGR", ParentId = 2 };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.UpdateJobTitleAsync(1, dto));
            Assert.Contains("vòng lặp", ex.Message);
        }

        [Fact]
        public async Task DeleteJobTitle_Throws_WhenIsSuperior()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.JobTitles.Add(new JobTitles { Id = 1, tenant_id = tenantId, name = "Superior", code = "SUP" });
            context.JobTitles.Add(new JobTitles { Id = 2, tenant_id = tenantId, name = "Subordinate", code = "SUB", parent_id = 1 });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteJobTitleAsync(1));
            Assert.Contains("cấp trên của chức danh khác", ex.Message);
        }

        [Fact]
        public async Task DeleteJobTitle_Throws_WhenHasEmployees()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.JobTitles.Add(new JobTitles { Id = 1, tenant_id = tenantId, name = "Title", code = "T1" });
            context.Employees.Add(new ERP.Entities.Models.Employees { Id = 1, tenant_id = tenantId, job_title_id = 1, employee_code = "E1" });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteJobTitleAsync(1));
            Assert.Contains("nhân viên trực thuộc", ex.Message);
        }

        [Fact]
        public async Task GetDepartmentsDropdownAsync_FiltersByBranch()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            context.Departments.AddRange(new List<Departments>
            {
                new Departments { Id = 1, tenant_id = tenantId, name = "D1", code = "D1", branch_id = 1 },
                new Departments { Id = 2, tenant_id = tenantId, name = "D2", code = "D2", branch_id = 2 }
            });
            await context.SaveChangesAsync();

            var service = new OrganizationService(context, _mockUserContext.Object);

            // Act
            var result = await service.GetDepartmentsDropdownAsync(1);

            // Assert
            Assert.Single(result);
            Assert.Equal("D1", result.First().Name);
        }
    }
}
