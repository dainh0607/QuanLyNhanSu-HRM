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
    public class DisciplineTypeServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<ICurrentUserContext> _userContextMock;
        private readonly DisciplineTypeService _service;

        public DisciplineTypeServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _userContextMock = new Mock<ICurrentUserContext>();
            _userContextMock.Setup(x => x.TenantId).Returns(1);

            _context = new AppDbContext(options, _userContextMock.Object);
            _service = new DisciplineTypeService(_context, _userContextMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ThrowsException_WhenKeywordExists()
        {
            // Arrange
            _context.DisciplineTypes.Add(new DisciplineTypes { name = "Warn", keyword = "KYLUAT_WARN", tenant_id = 1 });
            await _context.SaveChangesAsync();

            var dto = new DisciplineTypeCreateUpdateDto { Name = "Warn 2", Keyword = "KYLUAT_WARN" };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenInUseByEmployeeDecisions()
        {
            // Arrange
            var type = new DisciplineTypes { name = "Fire", keyword = "KYLUAT_FIRE", tenant_id = 1 };
            _context.DisciplineTypes.Add(type);
            await _context.SaveChangesAsync();

            _context.Set<RequestDisciplines>().Add(new RequestDisciplines 
            { 
                request_id = 1, 
                discipline_type_id = type.Id, 
                tenant_id = 1,
                title = "Fire him",
                reason = "Bad performance"
            });
            await _context.SaveChangesAsync();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(type.Id));
            Assert.Contains("hồ sơ vi phạm", ex.Message);
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenKeywordFoundInPayroll()
        {
            // Arrange
            var type = new DisciplineTypes { name = "Fine", keyword = "KYLUAT_FINE", tenant_id = 1 };
            _context.DisciplineTypes.Add(type);
            await _context.SaveChangesAsync();

            _context.PayrollDetails.Add(new PayrollDetails 
            { 
                payroll_id = 1, 
                component_name = "Penalty KYLUAT_FINE", 
                tenant_id = 1,
                amount = -500,
                component_type = "DEDUCTION",
                note = "Violate rule"
            });
            await _context.SaveChangesAsync();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(type.Id));
            Assert.Contains("công thức tính lương", ex.Message);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
