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
    public class AdvanceTypeServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<ICurrentUserContext> _userContextMock;
        private readonly AdvanceTypeService _service;

        public AdvanceTypeServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _userContextMock = new Mock<ICurrentUserContext>();
            _userContextMock.Setup(x => x.TenantId).Returns(1);

            _context = new AppDbContext(options, _userContextMock.Object);
            _service = new AdvanceTypeService(_context, _userContextMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ThrowsException_WhenNameExists()
        {
            // Arrange
            _context.AdvanceTypes.Add(new AdvanceTypes { name = "Salary Advance", tenant_id = 1 });
            await _context.SaveChangesAsync();

            var dto = new AdvanceTypeCreateUpdateDto { Name = "Salary Advance" };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenInUseByRequests()
        {
            // Arrange
            var type = new AdvanceTypes { name = "Travel Advance", tenant_id = 1 };
            _context.AdvanceTypes.Add(type);
            await _context.SaveChangesAsync();

            _context.Set<RequestSalaryAdvances>().Add(new RequestSalaryAdvances 
            { 
                request_id = 1, 
                advance_type_id = type.Id, 
                tenant_id = 1,
                title = "Travel to USA",
                reason = "Meeting"
            });
            await _context.SaveChangesAsync();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(type.Id));
            Assert.Contains("đơn từ tài chính", ex.Message);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
