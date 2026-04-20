using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Microsoft.EntityFrameworkCore;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Services.Employees;
using ERP.DTOs.Employees;
using ERP.Repositories.Interfaces;
using Moq;

namespace ERP.Tests.Services.Employees
{
    public class EmploymentHistoryServiceTests
    {
        private readonly DbContextOptions<AppDbContext> _options;
        private readonly Mock<IUnitOfWork> _mockUow;

        public EmploymentHistoryServiceTests()
        {
            _options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            _mockUow = new Mock<IUnitOfWork>();
        }

        private AppDbContext GetContext()
        {
            var mockUserContext = new Mock<ERP.Entities.Interfaces.ICurrentUserContext>();
            mockUserContext.Setup(c => c.TenantId).Returns(1);
            var context = new AppDbContext(_options, mockUserContext.Object);
            return context;
        }

        [Fact]
        public async Task GetPagedListAsync_FiltersByEmployeeId()
        {
            // Arrange
            using (var context = GetContext())
            {
                context.Employees.Add(new ERP.Entities.Models.Employees { Id = 1, tenant_id = 1, employee_code = "E1", full_name = "Emp 1", is_active = true });
                context.Employees.Add(new ERP.Entities.Models.Employees { Id = 2, tenant_id = 1, employee_code = "E2", full_name = "Emp 2", is_active = true });
                
                context.EmploymentHistoryLogs.AddRange(new List<EmploymentHistoryLog>
                {
                    new EmploymentHistoryLog { Id = 1, employee_id = 1, tenant_id = 1, change_type = "Promotion", decision_number = "QD01", work_status = "Active", note = "" },
                    new EmploymentHistoryLog { Id = 2, employee_id = 2, tenant_id = 1, change_type = "Transfer", decision_number = "QD02", work_status = "Active", note = "" }
                });
                await context.SaveChangesAsync();

                var service = new EmploymentHistoryService(_mockUow.Object, context);
                var filter = new EmploymentHistoryFilterDto { EmployeeId = 1, PageNumber = 1, PageSize = 10 };

                // Act
                var result = await service.GetPagedListAsync(filter);

                // Assert
                Assert.Equal(1, result.TotalCount);
                Assert.Equal(1, result.Items.First().EmployeeId);
            }
        }

        [Fact]
        public async Task GetPagedListAsync_FiltersByChangeType()
        {
            // Arrange
            using (var context = GetContext())
            {
                context.Employees.Add(new ERP.Entities.Models.Employees { Id = 1, tenant_id = 1, employee_code = "E1", full_name = "Emp 1", is_active = true });

                context.EmploymentHistoryLogs.AddRange(new List<EmploymentHistoryLog>
                {
                    new EmploymentHistoryLog { Id = 1, employee_id = 1, tenant_id = 1, change_type = "Promotion", decision_number = "QD01", work_status = "Active", note = "" },
                    new EmploymentHistoryLog { Id = 2, employee_id = 1, tenant_id = 1, change_type = "Transfer", decision_number = "QD02", work_status = "Active" , note = "" }
                });
                await context.SaveChangesAsync();

                var service = new EmploymentHistoryService(_mockUow.Object, context);
                var filter = new EmploymentHistoryFilterDto { ChangeType = "Promotion", PageNumber = 1, PageSize = 10 };

                // Act
                var result = await service.GetPagedListAsync(filter);

                // Assert
                Assert.Equal(1, result.TotalCount);
                Assert.Equal("Promotion", result.Items.First().ChangeType);
            }
        }

        [Fact]
        public async Task DeleteAsync_RemovesItem()
        {
            // Arrange
            using (var context = GetContext())
            {
                context.EmploymentHistoryLogs.Add(new EmploymentHistoryLog { Id = 1, employee_id = 1, change_type = "Test", decision_number = "T1", work_status = "Active", note = "" });
                await context.SaveChangesAsync();

                var service = new EmploymentHistoryService(_mockUow.Object, context);

                // Act
                var result = await service.DeleteAsync(1);

                // Assert
                Assert.True(result);
                Assert.Empty(context.EmploymentHistoryLogs);
            }
        }

        [Fact]
        public async Task BulkDeleteAsync_RemovesMultipleItems()
        {
            // Arrange
            using (var context = GetContext())
            {
                context.EmploymentHistoryLogs.AddRange(new List<EmploymentHistoryLog>
                {
                    new EmploymentHistoryLog { Id = 1, employee_id = 1, change_type = "T1", decision_number = "D1", work_status = "Active", note = "" },
                    new EmploymentHistoryLog { Id = 2, employee_id = 1, change_type = "T2", decision_number = "D2", work_status = "Active", note = "" },
                    new EmploymentHistoryLog { Id = 3, employee_id = 1, change_type = "T3", decision_number = "D3", work_status = "Active", note = "" }
                });
                await context.SaveChangesAsync();

                var service = new EmploymentHistoryService(_mockUow.Object, context);

                // Act
                var result = await service.BulkDeleteAsync(new[] { 1, 3 });

                // Assert
                Assert.True(result);
                Assert.Equal(1, context.EmploymentHistoryLogs.Count());
                Assert.Equal(2, context.EmploymentHistoryLogs.First().Id);
            }
        }

        [Fact]
        public async Task CreateLogAsync_AddsNewLog()
        {
            // Arrange
            using (var context = GetContext())
            {
                var service = new EmploymentHistoryService(_mockUow.Object, context);
                var dto = new EmploymentHistoryLogDto
                {
                    EmployeeId = 1,
                    ChangeType = "Manual",
                    DecisionNumber = "MN01",
                    EffectiveDate = DateTime.Now,
                    WorkStatus = "Active",
                    Note = "Test Note"
                };

                // Act
                await service.CreateLogAsync(dto);

                // Assert
                Assert.Equal(1, context.EmploymentHistoryLogs.Count());
                var log = await context.EmploymentHistoryLogs.FirstAsync();
                Assert.Equal("Manual", log.change_type);
                Assert.Equal("MN01", log.decision_number);
            }
        }
    }
}
