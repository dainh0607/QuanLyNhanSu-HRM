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
    public class ResignationReasonServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<ICurrentUserContext> _userContextMock;
        private readonly ResignationReasonService _service;

        public ResignationReasonServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _userContextMock = new Mock<ICurrentUserContext>();
            _userContextMock.Setup(x => x.TenantId).Returns(1);

            _context = new AppDbContext(options, _userContextMock.Object);

            _service = new ResignationReasonService(_context, _userContextMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ThrowsException_WhenReasonNameExists()
        {
            // Arrange
            _context.ResignationReasons.Add(new ResignationReasons { name = "Personal", tenant_id = 1 });
            await _context.SaveChangesAsync();

            var dto = new ResignationReasonCreateUpdateDto { Name = "Personal" };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenReasonInUse()
        {
            // Arrange
            var reason = new ResignationReasons { name = "Terminated", tenant_id = 1 };
            _context.ResignationReasons.Add(reason);
            await _context.SaveChangesAsync();

            _context.Employees.Add(new ERP.Entities.Models.Employees 
            { 
                employee_code = "EMP999", 
                resignation_reason_id = reason.Id, 
                tenant_id = 1,
                gender_code = "M",
                marital_status_code = "S"
            });
            await _context.SaveChangesAsync();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(reason.Id));
            Assert.Contains("hồ sơ nhân viên nghỉ việc sử dụng", ex.Message);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
