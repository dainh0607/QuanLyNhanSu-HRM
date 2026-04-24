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
    public class MealTypeServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<ICurrentUserContext> _userContextMock;
        private readonly MealTypeService _service;

        public MealTypeServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _userContextMock = new Mock<ICurrentUserContext>();
            _userContextMock.Setup(x => x.TenantId).Returns(1);

            _context = new AppDbContext(options, _userContextMock.Object);
            _service = new MealTypeService(_context, _userContextMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ThrowsException_WhenKeywordExists()
        {
            // Arrange
            _context.MealTypes.Add(new MealTypes { name = "Lunch", keyword = "SUATAN_LUNCH", tenant_id = 1 });
            await _context.SaveChangesAsync();

            var dto = new MealTypeCreateUpdateDto { Name = "Lunch 2", Keyword = "SUATAN_LUNCH" };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenInUseByShifts()
        {
            // Arrange
            var type = new MealTypes { name = "Dinner", keyword = "SUATAN_DINNER", tenant_id = 1 };
            _context.MealTypes.Add(type);
            await _context.SaveChangesAsync();

            _context.Shifts.Add(new Shifts 
            { 
                Id = 1, 
                shift_code = "S1", 
                shift_name = "Shift 1", 
                meal_type_id = type.Id, 
                tenant_id = 1,
                keyword = "S1",
                symbol = "S1",
                color = "#FFFFFF"
            });
            await _context.SaveChangesAsync();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(type.Id));
            Assert.Contains("Ca làm việc", ex.Message);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
