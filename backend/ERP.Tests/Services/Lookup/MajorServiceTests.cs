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
    public class MajorServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<ICurrentUserContext> _userContextMock;
        private readonly MajorService _service;

        public MajorServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _userContextMock = new Mock<ICurrentUserContext>();
            _userContextMock.Setup(x => x.TenantId).Returns(1);

            _context = new AppDbContext(options, _userContextMock.Object);

            _service = new MajorService(_context, _userContextMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ThrowsException_WhenMajorNameExists()
        {
            // Arrange
            _context.Majors.Add(new Majors { name = "IT", tenant_id = 1 });
            await _context.SaveChangesAsync();

            var dto = new MajorCreateUpdateDto { Name = "IT" };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenMajorInUse()
        {
            // Arrange
            var major = new Majors { name = "Accounting", tenant_id = 1 };
            _context.Majors.Add(major);
            await _context.SaveChangesAsync();

            _context.Set<Education>().Add(new Education 
            { 
                employee_id = 1, 
                major_id = major.Id, 
                level = "Bachelor",
                institution = "Uni",
                major = "Accounting",
                tenant_id = 1 
            });
            await _context.SaveChangesAsync();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(major.Id));
            Assert.Contains("hồ sơ học vấn sử dụng", ex.Message);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
