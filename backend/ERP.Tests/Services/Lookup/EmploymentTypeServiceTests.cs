using System;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Lookup;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using ERP.Services.Lookup;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace ERP.Tests.Services.Lookup
{
    public class EmploymentTypeServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<ICurrentUserContext> _userContextMock;
        private readonly EmploymentTypeService _service;

        public EmploymentTypeServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _userContextMock = new Mock<ICurrentUserContext>();
            _userContextMock.Setup(x => x.TenantId).Returns(1);

            _context = new AppDbContext(options, _userContextMock.Object);

            _service = new EmploymentTypeService(_context, _userContextMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ThrowsException_WhenNameExists()
        {
            // Arrange
            _context.EmploymentTypes.Add(new EmploymentTypes { name = "Full-time", tenant_id = 1 });
            await _context.SaveChangesAsync();

            var dto = new EmploymentTypeCreateUpdateDto { Name = "Full-time" };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenInUseByEmployees()
        {
            // Arrange
            var type = new EmploymentTypes { name = "Contract", tenant_id = 1 };
            _context.EmploymentTypes.Add(type);
            await _context.SaveChangesAsync();

            _context.Employees.Add(new ERP.Entities.Models.Employees 
            { 
                employee_code = "EMP001", 
                employment_type_id = type.Id, 
                tenant_id = 1,
                gender_code = "M",
                marital_status_code = "S"
            });
            await _context.SaveChangesAsync();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(type.Id));
            Assert.Contains("nhân viên sử dụng", ex.Message);
        }

        [Fact]
        public async Task GetPagedAsync_ReturnsFilteredResults()
        {
            // Arrange
            _context.EmploymentTypes.AddRange(
                new EmploymentTypes { name = "Full-time", tenant_id = 1 },
                new EmploymentTypes { name = "Part-time", tenant_id = 1 },
                new EmploymentTypes { name = "Freelance", tenant_id = 1 }
            );
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetPagedAsync("time", 1, 10);

            // Assert
            Assert.Equal(2, result.TotalCount);
            Assert.All(result.Items, item => Assert.Contains("time", item.Name, StringComparison.OrdinalIgnoreCase));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
