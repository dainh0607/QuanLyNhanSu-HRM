using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using ERP.Services.Attendance;
using ERP.DTOs.Auth;
using ERP.Repositories.Interfaces;
using ERP.Entities.Models;
using ERP.DTOs.Attendance;
using MockQueryable.Moq;
using MockQueryable;
using Microsoft.EntityFrameworkCore;
using ERP.Entities;

namespace ERP.Tests.Services.Attendance
{
    public class ShiftAssignmentServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IGenericRepository<ShiftAssignments>> _mockAssignRepo;
        private readonly Mock<IGenericRepository<LeaveRequests>> _mockLeaveRepo;
        private readonly Mock<IShiftNotificationService> _mockNotifService;
        private readonly AppDbContext _context;
        private readonly ShiftAssignmentService _service;

        public ShiftAssignmentServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockAssignRepo = new Mock<IGenericRepository<ShiftAssignments>>();
            _mockLeaveRepo = new Mock<IGenericRepository<LeaveRequests>>();
            _mockNotifService = new Mock<IShiftNotificationService>();

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options, new Mock<ERP.Entities.Interfaces.ICurrentUserContext>().Object);

            _mockUow.Setup(u => u.Repository<ShiftAssignments>()).Returns(_mockAssignRepo.Object);
            _mockUow.Setup(u => u.Repository<LeaveRequests>()).Returns(_mockLeaveRepo.Object);

            _service = new ShiftAssignmentService(_mockUow.Object, _mockNotifService.Object, _context);
        }

        [Fact]
        public async Task CreateAssignmentAsync_Fail_EmployeeOnLeave()
        {
            // Arrange
            var leaves = new List<LeaveRequests>
            {
                new LeaveRequests { employee_id = 1, status = "Approved", start_date = new DateTime(2026, 4, 1), end_date = new DateTime(2026, 4, 30) }
            };
            _mockLeaveRepo.Setup(r => r.AsQueryable()).Returns(leaves.BuildMock());

            var dto = new ShiftAssignmentCreateDto
            {
                employee_id = 1,
                shift_id = 10,
                assignment_date = new DateTime(2026, 4, 18)
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.CreateAssignmentAsync(dto));
            Assert.Contains("nghỉ phép", ex.Message);
        }

        [Fact]
        public async Task BulkCreateAssignmentsAsync_MarkOvertime_WhenAlreadyHasShift()
        {
            // Arrange
            var empId = 1;
            var date = new DateTime(2026, 4, 20);
            
            // Existing assignment on the same day but different shift
            var existingOnDay = new List<ShiftAssignments>
            {
                new ShiftAssignments { employee_id = empId, assignment_date = date, shift_id = 5 }
            };
            _mockAssignRepo.Setup(r => r.AsQueryable()).Returns(existingOnDay.BuildMock());
            _mockLeaveRepo.Setup(r => r.AsQueryable()).Returns(new List<LeaveRequests>().BuildMock());
            
            _mockUow.Setup(u => u.BeginTransactionAsync()).Returns(Task.CompletedTask);

            var dto = new BulkShiftAssignmentCreateDto
            {
                shift_id = 10,
                assignment_date = date,
                employee_ids = new List<int> { empId }
            };

            // Act
            await _service.BulkCreateAssignmentsAsync(dto);

            // Assert
            _mockAssignRepo.Verify(r => r.AddRangeAsync(It.Is<List<ShiftAssignments>>(list => 
                list.Count == 1 && list.First().is_overtime == true)), Times.Once);
        }

        [Fact]
        public async Task PublishAssignmentsAsync_CallsNotification()
        {
            // Arrange
            var startDate = new DateTime(2026, 4, 20);
            var assignments = new List<ShiftAssignments>
            {
                new ShiftAssignments { Id = 101, assignment_date = startDate, status = "draft" },
                new ShiftAssignments { Id = 102, assignment_date = startDate.AddDays(1), status = "draft" }
            };
            _mockAssignRepo.Setup(r => r.AsQueryable()).Returns(assignments.BuildMock());
            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(2);

            // Act
            var result = await _service.PublishAssignmentsAsync(startDate.ToString("yyyy-MM-dd"), new List<int> { 101, 102 });

            // Assert
            Assert.Equal(2, result.AffectedCount);
            _mockNotifService.Verify(n => n.NotifyShiftPublishedAsync(It.Is<List<int>>(ids => ids.Contains(101) && ids.Contains(102))), Times.Once);
        }

        [Fact]
        public async Task CopyAssignmentsAsync_OverwriteMode_RemovesOld()
        {
            // Arrange
            var sourceDate = new DateTime(2026, 4, 13); // Monday
            var targetDate = new DateTime(2026, 4, 20); // Next Monday
            
            var sourceAssignments = new List<ShiftAssignments>
            {
                new ShiftAssignments { Id = 1, employee_id = 10, shift_id = 1, assignment_date = sourceDate }
            };
            _mockAssignRepo.Setup(r => r.AsQueryable()).Returns(sourceAssignments.BuildMock());

            // Target week already has a different assignment for the same employee
            var targetExisting = new List<ShiftAssignments>
            {
                new ShiftAssignments { Id = 99, employee_id = 10, shift_id = 2, assignment_date = targetDate }
            };
            // Mocking repository for multiple query scenarios (sourceQuery and existingTargetAssignments query)
            // Note: ShiftAssignmentService uses AsQueryable multiple times.
            // Simplified for test: 
            _mockAssignRepo.SetupSequence(r => r.AsQueryable())
                .Returns(sourceAssignments.BuildMock()) // sourceQuery
                .Returns(targetExisting.BuildMock());  // existingTargetAssignments

            _mockUow.Setup(u => u.BeginTransactionAsync()).Returns(Task.CompletedTask);
            _mockUow.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);

            var dto = new ShiftAssignmentCopyDto
            {
                SourceWeekStartDate = sourceDate.ToString("yyyy-MM-dd"),
                TargetWeekStartDates = new List<string> { targetDate.ToString("yyyy-MM-dd") },
                MergeMode = "overwrite",
                EmployeeIds = new List<int> { 10 }
            };

            // Act
            var result = await _service.CopyAssignmentsAsync(dto, 1);

            // Assert
            Assert.Equal(1, result.CopiedCount);
            _mockAssignRepo.Verify(r => r.RemoveRange(It.Is<List<ShiftAssignments>>(l => l.Any(x => x.Id == 99))), Times.Once);
            _mockAssignRepo.Verify(r => r.AddRangeAsync(It.Is<List<ShiftAssignments>>(l => l.Count == 1 && l.First().shift_id == 1)), Times.Once);
        }

        [Fact]
        public async Task GetAvailableUsersAsync_ExcludesExemptRoles()
        {
            // Arrange
            // 1. Setup Exempt Role in Memory DB
            var adminRoleId = AuthSecurityConstants.RoleAdminId;
            var empIdAdmin = 100;
            var userIdAdmin = 1000;
            
            // Add user first
            _context.Users.Add(new Users 
            { 
                Id = userIdAdmin, 
                employee_id = empIdAdmin, 
                is_active = true, 
                firebase_uid = "ADMIN_FIREBASE",
                username = "admin_test"
            });
            _context.UserRoles.Add(new UserRoles { user_id = userIdAdmin, role_id = adminRoleId, is_active = true });
            await _context.SaveChangesAsync();

            // 2. Setup Employees Repo
            var empList = new List<ERP.Entities.Models.Employees>
            {
                new ERP.Entities.Models.Employees { Id = empIdAdmin, full_name = "Admin User", branch_id = 1, is_active = true },
                new ERP.Entities.Models.Employees { Id = 200, full_name = "Regular User", branch_id = 1, is_active = true }
            };
            var mockEmpRepo = new Mock<IGenericRepository<ERP.Entities.Models.Employees>>();
            mockEmpRepo.Setup(r => r.AsQueryable()).Returns(empList.BuildMock());
            _mockUow.Setup(u => u.Repository<ERP.Entities.Models.Employees>()).Returns(mockEmpRepo.Object);

            _mockAssignRepo.Setup(r => r.AsQueryable()).Returns(new List<ShiftAssignments>().BuildMock());

            // Act
            var result = await _service.GetAvailableUsersAsync(1, 1, DateTime.Today);

            // Assert
            Assert.Single(result);
            Assert.Equal(200, result.First().EmployeeId); // Only regular user, admin is exempt
        }
    }
}
