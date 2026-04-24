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
    public class RewardTypeServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<ICurrentUserContext> _userContextMock;
        private readonly RewardTypeService _service;

        public RewardTypeServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _userContextMock = new Mock<ICurrentUserContext>();
            _userContextMock.Setup(x => x.TenantId).Returns(1);

            _context = new AppDbContext(options, _userContextMock.Object);
            _service = new RewardTypeService(_context, _userContextMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ThrowsException_WhenKeywordExists()
        {
            // Arrange
            _context.RewardTypes.Add(new RewardTypes { name = "Bonus", keyword = "THUONG_BONUS", tenant_id = 1 });
            await _context.SaveChangesAsync();

            var dto = new RewardTypeCreateUpdateDto { Name = "Bonus 2", Keyword = "THUONG_BONUS" };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenInUseByEmployeeRewards()
        {
            // Arrange
            var type = new RewardTypes { name = "KPI", keyword = "THUONG_KPI", tenant_id = 1 };
            _context.RewardTypes.Add(type);
            await _context.SaveChangesAsync();

            _context.Set<RequestRewards>().Add(new RequestRewards 
            { 
                request_id = 1, 
                reward_type_id = type.Id, 
                tenant_id = 1,
                title = "KPI Reward",
                reason = "Good work"
            });
            await _context.SaveChangesAsync();

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(type.Id));
            Assert.Contains("hồ sơ khen thưởng", ex.Message);
        }

        [Fact]
        public async Task DeleteAsync_ThrowsException_WhenKeywordFoundInPayroll()
        {
            // Arrange
            var type = new RewardTypes { name = "Project", keyword = "THUONG_PROJ", tenant_id = 1 };
            _context.RewardTypes.Add(type);
            await _context.SaveChangesAsync();

            _context.PayrollDetails.Add(new PayrollDetails 
            { 
                payroll_id = 1, 
                component_name = "Bonus THUONG_PROJ", 
                tenant_id = 1,
                amount = 2000,
                component_type = "REWARD",
                note = "Done"
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
