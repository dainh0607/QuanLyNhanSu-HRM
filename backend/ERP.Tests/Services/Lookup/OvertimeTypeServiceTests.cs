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
    public class OvertimeTypeServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<ICurrentUserContext> _userContextMock;
        private readonly OvertimeTypeService _service;

        public OvertimeTypeServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _userContextMock = new Mock<ICurrentUserContext>();
            _userContextMock.Setup(x => x.TenantId).Returns(1);

            _context = new AppDbContext(options, _userContextMock.Object);
            _service = new OvertimeTypeService(_context, _userContextMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ThrowsException_WhenKeywordExists()
        {
            // Arrange
            _context.OvertimeTypes.Add(new OvertimeTypes { name = "Type 1", keyword = "OT_150", tenant_id = 1 });
            await _context.SaveChangesAsync();

            var dto = new OvertimeTypeCreateUpdateDto { Name = "Type 2", Keyword = "OT_150", RatePercentage = 150 };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenInUseByRequests()
        {
            // Arrange
            var type = new OvertimeTypes { name = "OT", keyword = "OT_KW", tenant_id = 1 };
            _context.OvertimeTypes.Add(type);
            await _context.SaveChangesAsync();

            _context.Set<RequestOvertime>().Add(new RequestOvertime 
            { 
                request_id = 1, 
                overtime_type_id = type.Id, 
                tenant_id = 1,
                reason = "Work",
                handover_note = "None"
            });
            await _context.SaveChangesAsync();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(type.Id));
            Assert.Contains("dữ liệu chấm công", ex.Message);
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenKeywordFoundInPayroll()
        {
            // Arrange
            var type = new OvertimeTypes { name = "Holiday", keyword = "OT_300", tenant_id = 1 };
            _context.OvertimeTypes.Add(type);
            await _context.SaveChangesAsync();

            _context.PayrollDetails.Add(new PayrollDetails 
            { 
                payroll_id = 1, 
                component_name = "OT_300 Calculation", 
                tenant_id = 1,
                amount = 1000,
                component_type = "OT",
                note = "N/A"
            });
            await _context.SaveChangesAsync();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(type.Id));
            Assert.Contains("bảng lương đã chốt", ex.Message);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
