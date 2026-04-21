using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Microsoft.EntityFrameworkCore;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Services.Employees;
using ERP.DTOs.Employees.Profile;
using ERP.Repositories.Interfaces;
using Moq;

namespace ERP.Tests.Services.Employees
{
    public class SalaryConfigurationServiceTests
    {
        private readonly DbContextOptions<AppDbContext> _options;
        private readonly Mock<IUnitOfWork> _mockUow;

        public SalaryConfigurationServiceTests()
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
        public async Task GetSalaryPackageAsync_ReturnsCorrectData()
        {
            // Arrange
            using (var context = GetContext())
            {
                var grade = new SalaryGrade { Id = 1, name = "Level 1", amount = 5000000 };
                context.SalaryGrades.Add(grade);

                var allowanceType = new AllowanceType { Id = 1, name = "Lunch" };
                context.AllowanceTypes.Add(allowanceType);

                var salary = new Salaries
                {
                    Id = 1,
                    employee_id = 100,
                    payment_method = "Monthly",
                    salary_grade_id = 1,
                    base_salary = 5000000
                };
                context.Salaries.Add(salary);

                context.Allowances.Add(new Allowances { salary_id = 1, allowance_type_id = 1, amount = 500000 });
                
                await context.SaveChangesAsync();

                _mockUow.Setup(u => u.SaveChangesAsync()).Returns(() => context.SaveChangesAsync());
                var service = new SalaryConfigurationService(_mockUow.Object, context);

                // Act
                var result = await service.GetSalaryPackageAsync(100);

                // Assert
                Assert.NotNull(result);
                Assert.Equal("Monthly", result.BaseSalary.PaymentMethod);
                Assert.Equal(5000000, result.BaseSalary.Amount);
                Assert.Single(result.Allowances);
                Assert.Equal("Lunch", result.Allowances.First().AllowanceTypeName);
            }
        }

        [Fact]
        public async Task UpdateSalaryPackageAsync_Fail_OverlappingVariableSalaries()
        {
            // Arrange
            using (var context = GetContext())
            {
                var service = new SalaryConfigurationService(_mockUow.Object, context);
                var dto = new SalaryPackageDto
                {
                    VariableSalaries = new List<VariableSalaryDto>
                    {
                        new VariableSalaryDto { StartDate = new DateTime(2024, 1, 1), EndDate = new DateTime(2024, 3, 1), SalaryGradeId = 1 },
                        new VariableSalaryDto { StartDate = new DateTime(2024, 2, 1), EndDate = new DateTime(2024, 4, 1), SalaryGradeId = 2 }
                    }
                };

                // Act & Assert
                var ex = await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateSalaryPackageAsync(100, dto));
                Assert.Contains("trùng lặp", ex.Message);
            }
        }

        [Fact]
        public async Task UpdateSalaryPackageAsync_Success_SyncsAllData()
        {
            // Arrange
            using (var context = GetContext())
            {
                // Existing data
                var salary = new Salaries { Id = 1, employee_id = 100, payment_method = "Monthly" };
                context.Salaries.Add(salary);
                context.Allowances.Add(new Allowances { salary_id = 1, allowance_type_id = 1, amount = 100 });
                await context.SaveChangesAsync();

                _mockUow.Setup(u => u.SaveChangesAsync()).Returns(() => context.SaveChangesAsync());
                var service = new SalaryConfigurationService(_mockUow.Object, context);
                var dto = new SalaryPackageDto
                {
                    BaseSalary = new BaseSalaryConfigDto { PaymentMethod = "Hourly", Amount = 200 },
                    Allowances = new List<AllowanceItemDto>
                    {
                        new AllowanceItemDto { AllowanceTypeId = 2, Amount = 500 }
                    },
                    VariableSalaries = new List<VariableSalaryDto>
                    {
                        new VariableSalaryDto { StartDate = new DateTime(2024, 1, 1), EndDate = new DateTime(2024, 1, 31), SalaryGradeId = 1, PaymentMethod = "Monthly" }
                    }
                };

                // Act
                var result = await service.UpdateSalaryPackageAsync(100, dto);

                // Assert
                Assert.True(result);

                // Use a fresh context or clear tracker to verify DB state correctly
                using (var verifyContext = GetContext())
                {
                    var updatedSalary = await verifyContext.Salaries
                        .Include(s => s.Allowances)
                        .Include(s => s.VariableSalaries)
                        .FirstAsync(s => s.employee_id == 100);

                    Assert.Equal("Hourly", updatedSalary.payment_method);
                    Assert.Single(updatedSalary.Allowances);
                    Assert.Equal(2, updatedSalary.Allowances.First().allowance_type_id);
                    Assert.Single(updatedSalary.VariableSalaries);
                }
            }
        }

        [Fact]
        public async Task CreateSalaryGradeAsync_AddsToDb()
        {
            // Arrange
            using (var context = GetContext())
            {
                _mockUow.Setup(u => u.SaveChangesAsync()).Returns(() => context.SaveChangesAsync());
                var service = new SalaryConfigurationService(_mockUow.Object, context);
                var dto = new SalaryGradeCreateDto { Name = "New Grade", Amount = 10000000 };

                // Act
                var result = await service.CreateSalaryGradeAsync(dto);

                // Assert
                Assert.NotNull(result);
                Assert.Equal("New Grade", result.Name);
                Assert.Equal(10000000, result.Amount);
                Assert.Equal(1, context.SalaryGrades.Count());
            }
        }

        [Fact]
        public async Task GetLookups_ReturnOnlyActiveItems()
        {
            // Arrange
            using (var context = GetContext())
            {
                context.AllowanceTypes.Add(new AllowanceType { Id = 1, name = "Active", is_active = true });
                context.AllowanceTypes.Add(new AllowanceType { Id = 2, name = "Inactive", is_active = false });
                await context.SaveChangesAsync();

                var service = new SalaryConfigurationService(_mockUow.Object, context);

                // Act
                var result = await service.GetAllowanceTypesAsync();

                // Assert
                Assert.Single(result);
                Assert.Equal("Active", result.First().Name);
            }
        }
    }
}
