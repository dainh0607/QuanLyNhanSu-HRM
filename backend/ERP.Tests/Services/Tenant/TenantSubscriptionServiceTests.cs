using System;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Tenant;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using ERP.Entities.Models.ControlPlane;
using ERP.Services.Tenant;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ERP.Tests.Services.Tenant
{
    public class TenantSubscriptionServiceTests
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
        public async Task GetMySubscriptionAsync_ReturnsCorrectData_WhenSubscriptionExists()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            var plan = new SubscriptionPlan
            {
                Id = 1,
                Name = "Growth",
                Code = "GROWTH",
                EmployeeSeatLimit = 50,
                StorageLimitGb = 10,
                MonthlyPriceVnd = 1000000,
                Modules = "Employees,Attendance,Payroll"
            };
            context.SubscriptionPlans.Add(plan);

            context.TenantSubscriptions.Add(new TenantSubscription
            {
                TenantId = tenantId,
                PlanId = plan.Id,
                Status = "Active",
                BillingCycle = "Monthly",
                NextRenewalAt = DateTime.UtcNow.AddDays(30),
                Plan = plan
            });

            // Add some employees
            context.Employees.Add(new ERP.Entities.Models.Employees { Id = 1, tenant_id = tenantId, is_active = true, is_resigned = false, employee_code = "E1" });
            context.Employees.Add(new ERP.Entities.Models.Employees { Id = 2, tenant_id = tenantId, is_active = true, is_resigned = false, employee_code = "E2" });
            context.Employees.Add(new ERP.Entities.Models.Employees { Id = 3, tenant_id = tenantId, is_active = false, is_resigned = true, employee_code = "E3" }); // Should not count

            // Add some documents
            context.EmployeeDocuments.Add(new EmployeeDocuments { Id = 1, tenant_id = tenantId, FileSize = 1024 * 1024 * 512, DocumentName = "Doc1", DocumentType = "PDF", FileUrl = "http://doc1" }); // 0.5 GB
            context.EmployeeDocuments.Add(new EmployeeDocuments { Id = 2, tenant_id = tenantId, FileSize = 1024 * 1024 * 512, DocumentName = "Doc2", DocumentType = "PDF", FileUrl = "http://doc2" }); // 0.5 GB

            await context.SaveChangesAsync();

            var service = new TenantSubscriptionService(context, _mockUserContext.Object);

            // Act
            var result = await service.GetMySubscriptionAsync();

            // Assert
            Assert.Equal("Growth", result.PlanName);
            Assert.Equal(2, result.ActiveEmployees);
            Assert.Equal(1.0, result.StorageUsedGb, 1); 
            Assert.Equal(50, result.EmployeeLimit);
            Assert.Equal(10, result.StorageLimitGb);
        }

        [Fact]
        public async Task GetMySubscriptionAsync_ReturnsDefault_WhenNoSubscriptionFound()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            var service = new TenantSubscriptionService(context, _mockUserContext.Object);

            // Act
            var result = await service.GetMySubscriptionAsync();

            // Assert
            Assert.Contains("Trial", result.PlanName);
            Assert.Equal(0, result.ActiveEmployees);
            Assert.Equal(5, result.EmployeeLimit); // Default trial limit in service is 5
        }

        [Fact]
        public async Task CreateUpgradeRequestAsync_CreatesRequestSuccessfully()
        {
            // Arrange
            var context = GetDbContext();
            int tenantId = 1;
            _mockUserContext.Setup(c => c.TenantId).Returns(tenantId);

            var service = new TenantSubscriptionService(context, _mockUserContext.Object);
            var dto = new UpgradeRequestDto
            {
                TargetPlanCode = "ENTERPRISE",
                Note = "Scaling up"
            };

            // Act
            var result = await service.CreateUpgradeRequestAsync(dto);

            // Assert
            Assert.True(result);
            
            var dbRequest = await context.TenantUpgradeRequests.FirstOrDefaultAsync(r => r.TenantId == tenantId);
            Assert.NotNull(dbRequest);
            Assert.Equal("ENTERPRISE", dbRequest.TargetPlanCode);
            Assert.Equal("Pending", dbRequest.Status);
        }

        [Fact]
        public async Task CreateUpgradeRequestAsync_Throws_WhenTenantContextMissing()
        {
            // Arrange
            var context = GetDbContext();
            _mockUserContext.Setup(c => c.TenantId).Returns((int?)null);

            var service = new TenantSubscriptionService(context, _mockUserContext.Object);
            var dto = new UpgradeRequestDto { TargetPlanCode = "GROWTH" };

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.CreateUpgradeRequestAsync(dto));
        }
    }
}
