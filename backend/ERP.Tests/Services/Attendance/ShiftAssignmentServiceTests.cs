using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using ERP.Services.Attendance;
using ERP.Repositories.Interfaces;
using ERP.Entities.Models;
using ERP.DTOs.Attendance;
using MockQueryable.Moq;
using MockQueryable;

namespace ERP.Tests.Services.Attendance
{
    public class ShiftAssignmentServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IGenericRepository<ShiftAssignments>> _mockAssignRepo;
        private readonly ShiftAssignmentService _service;

        public ShiftAssignmentServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockAssignRepo = new Mock<IGenericRepository<ShiftAssignments>>();

            var mockNotifService = new Mock<IShiftNotificationService>();

            _mockUow.Setup(u => u.Repository<ShiftAssignments>()).Returns(_mockAssignRepo.Object);

            _service = new ShiftAssignmentService(_mockUow.Object, mockNotifService.Object);
        }

        [Fact]
        public async Task BulkCreateAssignmentsAsync_ShouldInsertOnlyUnassignedUsers()
        {
            // Arrange
            var existingAssignments = new List<ShiftAssignments>
            {
                new ShiftAssignments { employee_id = 1, shift_id = 10, assignment_date = new DateTime(2026, 4, 18) }
            };

            var mockQueryable = existingAssignments.BuildMock();
            _mockAssignRepo.Setup(r => r.AsQueryable()).Returns(mockQueryable);

            _mockUow.Setup(u => u.BeginTransactionAsync()).Returns(Task.CompletedTask);
            _mockUow.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);

            var dto = new BulkShiftAssignmentCreateDto
            {
                shift_id = 10,
                assignment_date = new DateTime(2026, 4, 18),
                employee_ids = new List<int> { 1, 2, 3 } // 1 is already assigned, 2 and 3 should be added
            };

            // Act
            var result = await _service.BulkCreateAssignmentsAsync(dto);

            // Assert
            Assert.True(result);
            _mockAssignRepo.Verify(r => r.AddRangeAsync(It.Is<List<ShiftAssignments>>(list => list.Count == 2 && list.Any(a => a.employee_id == 2) && list.Any(a => a.employee_id == 3))), Times.Once);
        }

        [Fact]
        public async Task GetAvailableUsersAsync_ShouldExcludeAssignedUsers()
        {
            // Arrange
            var allEmployees = new List<Employees>
            {
                new Employees { Id = 1, employee_code = "E01", branch_id = 5, is_active = true, is_resigned = false },
                new Employees { Id = 2, employee_code = "E02", branch_id = 5, is_active = true, is_resigned = false },
                new Employees { Id = 3, employee_code = "E03", branch_id = 5, is_active = true, is_resigned = false }
            };

            var mockEmpRepo = new Mock<IGenericRepository<Employees>>();
            mockEmpRepo.Setup(r => r.AsQueryable()).Returns(allEmployees.BuildMock());
            _mockUow.Setup(u => u.Repository<Employees>()).Returns(mockEmpRepo.Object);

            var existingAssignments = new List<ShiftAssignments>
            {
                new ShiftAssignments { employee_id = 2, shift_id = 10, assignment_date = new DateTime(2026, 4, 18) }
            };
            var mockAssignQueryable = existingAssignments.BuildMock();
            _mockAssignRepo.Setup(r => r.AsQueryable()).Returns(mockAssignQueryable);

            // Act
            var result = await _service.GetAvailableUsersAsync(5, 10, new DateTime(2026, 4, 18));

            // Assert
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Contains(resultList, x => x.EmployeeId == 1);
            Assert.Contains(resultList, x => x.EmployeeId == 3);
            Assert.DoesNotContain(resultList, x => x.EmployeeId == 2);
        }
    }
}
