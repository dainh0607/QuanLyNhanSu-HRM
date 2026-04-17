using System;
using System.Threading.Tasks;
using Xunit;
using Moq;
using ERP.Services.Attendance;
using ERP.Repositories.Interfaces;
using ERP.Entities.Models;
using ERP.DTOs.Attendance;
using ERP.Services.Authorization;
using System.Linq;
using MockQueryable.Moq;
using MockQueryable;

namespace ERP.Tests.Services.Attendance
{
    public class LeaveRequestServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IGenericRepository<Shifts>> _mockShiftRepo;
        private readonly Mock<IGenericRepository<LeaveRequests>> _mockLeaveRepo;
        private readonly Mock<IGenericRepository<EmployeeLeaves>> _mockEmpLeaveRepo;
        private readonly Mock<IGenericRepository<LeaveTypes>> _mockLeaveTypeRepo;
        private readonly Mock<IGenericRepository<LeaveDurationTypes>> _mockDurationTypeRepo;
        private readonly Mock<Microsoft.Extensions.Logging.ILogger<LeaveRequestService>> _mockLogger;
        private readonly LeaveRequestService _service;

        public LeaveRequestServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockShiftRepo = new Mock<IGenericRepository<Shifts>>();
            _mockLeaveRepo = new Mock<IGenericRepository<LeaveRequests>>();
            _mockEmpLeaveRepo = new Mock<IGenericRepository<EmployeeLeaves>>();
            _mockLeaveTypeRepo = new Mock<IGenericRepository<LeaveTypes>>();
            _mockDurationTypeRepo = new Mock<IGenericRepository<LeaveDurationTypes>>();
            
            _mockLogger = new Mock<Microsoft.Extensions.Logging.ILogger<LeaveRequestService>>();

            _mockUow.Setup(u => u.Repository<Shifts>()).Returns(_mockShiftRepo.Object);
            _mockUow.Setup(u => u.Repository<LeaveRequests>()).Returns(_mockLeaveRepo.Object);
            _mockUow.Setup(u => u.Repository<EmployeeLeaves>()).Returns(_mockEmpLeaveRepo.Object);
            _mockUow.Setup(u => u.Repository<LeaveTypes>()).Returns(_mockLeaveTypeRepo.Object);
            _mockUow.Setup(u => u.Repository<LeaveDurationTypes>()).Returns(_mockDurationTypeRepo.Object);

            _service = new LeaveRequestService(_mockUow.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task CreateMatrixLeaveRequestAsync_Success_ShouldAutoApprove()
        {
            // Arrange
            var shift = new Shifts
            {
                Id = 1,
                start_time = new TimeSpan(8, 0, 0),
                end_time = new TimeSpan(17, 0, 0),
                is_overnight = false
            };

            _mockShiftRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(shift);
            _mockLeaveTypeRepo.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(new LeaveTypes { Id = 2, is_paid = true, name = "Sick" });
            
            var dummyDurations = new List<LeaveDurationTypes>
            {
                new LeaveDurationTypes { Id = 1, code = "HALF" }
            };
            _mockDurationTypeRepo.Setup(r => r.AsQueryable()).Returns(dummyDurations.BuildMock());
            
            var dummyEmployeeLeaves = new List<EmployeeLeaves>();
            _mockEmpLeaveRepo.Setup(r => r.AsQueryable()).Returns(dummyEmployeeLeaves.BuildMock());
            
            _mockUow.Setup(u => u.BeginTransactionAsync()).Returns(Task.CompletedTask);
            _mockUow.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);
            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            var dto = new LeaveRequestCreateMatrixDto
            {
                employee_id = 99,
                shift_id = 1,
                leave_type_id = 2,
                leave_type_duration = "HALF", // 4.5 hours typically
                leave_date = DateTime.Today,
                reason = "Sick"
            };

            // Act
            var result = await _service.CreateMatrixLeaveRequestAsync(dto, 1);

            // Assert
            Assert.True(result);
            _mockLeaveRepo.Verify(r => r.AddAsync(It.Is<LeaveRequests>(req => req.status == "APPROVED" && req.number_of_hours == 4.5m)), Times.Once);
        }

        [Fact]
        public async Task CreateMatrixLeaveRequestAsync_Fail_HourlyOutsideShiftBoundaries()
        {
            // Arrange
            var shift = new Shifts
            {
                Id = 1,
                start_time = new TimeSpan(8, 0, 0),
                end_time = new TimeSpan(17, 0, 0),
                is_overnight = false
            };

            _mockShiftRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(shift);
            
            var dto = new LeaveRequestCreateMatrixDto
            {
                employee_id = 99,
                shift_id = 1,
                leave_type_id = 2,
                leave_type_duration = "HOURLY",
                leave_date = DateTime.Today,
                start_time = "18:00", // After shift ends
                end_time = "19:00",
                reason = "Sick"
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.CreateMatrixLeaveRequestAsync(dto, 1));
            Assert.Contains("nằm trong thời gian", ex.Message);
        }
    }
}
