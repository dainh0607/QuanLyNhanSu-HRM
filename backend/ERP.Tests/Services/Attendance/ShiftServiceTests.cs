using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using ERP.Services.Attendance;
using ERP.Repositories.Interfaces;
using ERP.DTOs.Attendance;
using MockQueryable.Moq;
using MockQueryable;
using ERP.Services.Authorization;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;

namespace ERP.Tests.Services.Attendance
{
    public class ShiftServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IGenericRepository<Shifts>> _mockShiftRepo;
        private readonly Mock<IGenericRepository<ShiftAssignments>> _mockAssignRepo;
        private readonly ShiftService _service;

        public ShiftServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockShiftRepo = new Mock<IGenericRepository<Shifts>>();
            _mockAssignRepo = new Mock<IGenericRepository<ShiftAssignments>>();
            var mockAuthService = new Mock<IAuthorizationService>();
            var mockUserContext = new Mock<ICurrentUserContext>();

            _mockUow.Setup(u => u.Repository<Shifts>()).Returns(_mockShiftRepo.Object);
            _mockUow.Setup(u => u.Repository<ShiftAssignments>()).Returns(_mockAssignRepo.Object);

            _service = new ShiftService(_mockUow.Object, mockAuthService.Object, mockUserContext.Object);
        }

        [Fact]
        public async Task UpdateShiftAsync_Fail_OverlapCode()
        {
            // Arrange
            var shiftToUpdate = new Shifts { Id = 1, shift_code = "CA_SANG" };
            _mockShiftRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(shiftToUpdate);

            var existingShifts = new List<Shifts>
            {
                new Shifts { Id = 2, shift_code = "CA_CHIEU" } // This exists in another ID
            };
            _mockShiftRepo.Setup(r => r.AsQueryable()).Returns(existingShifts.BuildMock());

            var dto = new ShiftUpdateDto
            {
                shift_code = "CA_CHIEU", // Attempt to update to an existing code
                start_time = "08:00",
                end_time = "17:00"
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.UpdateShiftAsync(1, dto));
            Assert.Contains("đã tồn tại trong hệ thống", ex.Message);
        }

        [Fact]
        public async Task DeleteOrDeactivateShiftAsync_SoftDeleteIfHavingAssignments()
        {
            // Arrange
            var shiftToDel = new Shifts { Id = 1, shift_code = "CA_SANG", is_active = true };
            _mockShiftRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(shiftToDel);

            var existingAssignments = new List<ShiftAssignments>
            {
                new ShiftAssignments { Id = 100, shift_id = 1 } // Shift 1 has assignments
            };
            _mockAssignRepo.Setup(r => r.AsQueryable()).Returns(existingAssignments.BuildMock());
            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            var result = await _service.DeleteOrDeactivateShiftAsync(1);

            // Assert
            Assert.True(result);
            _mockShiftRepo.Verify(r => r.Update(It.Is<Shifts>(s => s.is_active == false)), Times.Once); // Soft delete occurred
            _mockShiftRepo.Verify(r => r.Remove(It.IsAny<Shifts>()), Times.Never); // Hard delete NEVER occurred
        }
    }
}
