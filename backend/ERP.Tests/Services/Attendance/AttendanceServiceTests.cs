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
using Microsoft.Extensions.Logging;
using ERP.Services.Authorization;
using ERP.Entities.Interfaces;
using MockQueryable.Moq;
using MockQueryable;
using Microsoft.EntityFrameworkCore;

namespace ERP.Tests.Services.Attendance
{
    public class AttendanceServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IGenericRepository<AttendanceRecords>> _mockAttendanceRepo;
        private readonly Mock<IGenericRepository<Users>> _mockUserRepo;
        private readonly Mock<IGenericRepository<AttendanceModifications>> _mockModRepo;
        private readonly Mock<IGenericRepository<EmployeeTimekeepingMachines>> _mockMachineRepo;
        private readonly Mock<IGenericRepository<TimeMachines>> _mockTimeMachineRepo;
        private readonly Mock<IGenericRepository<AttendanceSettings>> _mockSettingsRepo;
        private readonly Mock<IGenericRepository<ShiftAssignments>> _mockShiftAssignmentRepo;
        private readonly Mock<ILogger<AttendanceService>> _mockLogger;
        private readonly Mock<IAuthorizationService> _mockAuthService;
        private readonly Mock<ICurrentUserContext> _mockUserContext;

        private readonly AttendanceService _service;

        public AttendanceServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockAttendanceRepo = new Mock<IGenericRepository<AttendanceRecords>>();
            _mockUserRepo = new Mock<IGenericRepository<Users>>();
            _mockModRepo = new Mock<IGenericRepository<AttendanceModifications>>();
            _mockMachineRepo = new Mock<IGenericRepository<EmployeeTimekeepingMachines>>();
            _mockTimeMachineRepo = new Mock<IGenericRepository<TimeMachines>>();
            _mockSettingsRepo = new Mock<IGenericRepository<AttendanceSettings>>();
            _mockShiftAssignmentRepo = new Mock<IGenericRepository<ShiftAssignments>>();

            _mockUow.Setup(u => u.Repository<AttendanceRecords>()).Returns(_mockAttendanceRepo.Object);
            _mockUow.Setup(u => u.Repository<Users>()).Returns(_mockUserRepo.Object);
            _mockUow.Setup(u => u.Repository<AttendanceModifications>()).Returns(_mockModRepo.Object);
            _mockUow.Setup(u => u.Repository<EmployeeTimekeepingMachines>()).Returns(_mockMachineRepo.Object);
            _mockUow.Setup(u => u.Repository<TimeMachines>()).Returns(_mockTimeMachineRepo.Object);
            _mockUow.Setup(u => u.Repository<AttendanceSettings>()).Returns(_mockSettingsRepo.Object);
            _mockUow.Setup(u => u.Repository<ShiftAssignments>()).Returns(_mockShiftAssignmentRepo.Object);

            _mockLogger = new Mock<ILogger<AttendanceService>>();
            _mockAuthService = new Mock<IAuthorizationService>();
            _mockUserContext = new Mock<ICurrentUserContext>();

            // Default setup for AsQueryable for all repositories
            _mockAttendanceRepo.Setup(r => r.AsQueryable()).Returns(new List<AttendanceRecords>().BuildMock());
            _mockUserRepo.Setup(r => r.AsQueryable()).Returns(new List<Users>().BuildMock());
            _mockModRepo.Setup(r => r.AsQueryable()).Returns(new List<AttendanceModifications>().BuildMock());
            _mockMachineRepo.Setup(r => r.AsQueryable()).Returns(new List<EmployeeTimekeepingMachines>().BuildMock());
            _mockTimeMachineRepo.Setup(r => r.AsQueryable()).Returns(new List<TimeMachines>().BuildMock());
            _mockSettingsRepo.Setup(r => r.AsQueryable()).Returns(new List<AttendanceSettings>().BuildMock());
            _mockShiftAssignmentRepo.Setup(r => r.AsQueryable()).Returns(new List<ShiftAssignments>().BuildMock());

            _service = new AttendanceService(_mockUow.Object, _mockLogger.Object, _mockAuthService.Object, _mockUserContext.Object);
        }

        [Fact]
        public async Task CheckInAsync_Success()
        {
            // Arrange
            var userId = 1;
            var user = new Users { Id = userId, employee_id = 10 };
            _mockUserRepo.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            var dto = new AttendanceCheckInDto { Latitude = 21.0285m, Longitude = 105.8542m, Note = "Check-in test" };

            // Act
            var result = await _service.CheckInAsync(userId, dto);

            // Assert
            Assert.True(result);
            _mockAttendanceRepo.Verify(r => r.AddAsync(It.Is<AttendanceRecords>(rec => 
                rec.employee_id == 10 && 
                rec.record_type == "IN" && 
                rec.location_lat == dto.Latitude)), Times.Once);
        }

        [Fact]
        public async Task CheckOutAsync_Success()
        {
            // Arrange
            var userId = 1;
            var user = new Users { Id = userId, employee_id = 10 };
            _mockUserRepo.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            var dto = new AttendanceCheckInDto { Latitude = 21.0285m, Longitude = 105.8542m, Note = "Check-out test" };

            // Act
            var result = await _service.CheckOutAsync(userId, dto);

            // Assert
            Assert.True(result);
            _mockAttendanceRepo.Verify(r => r.AddAsync(It.Is<AttendanceRecords>(rec => 
                rec.employee_id == 10 && 
                rec.record_type == "OUT")), Times.Once);
        }

        [Fact]
        public async Task GetTodayAttendanceAsync_Forbidden_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            var currentUserId = 1;
            var targetEmployeeId = 99;
            _mockUserContext.Setup(c => c.UserId).Returns(currentUserId);
            _mockAuthService.Setup(a => a.CanAccessEmployee(currentUserId, targetEmployeeId)).ReturnsAsync(false);
            
            // Mock empty users for the employee check
            _mockUserRepo.Setup(r => r.AsQueryable()).Returns(new List<Users>().BuildMock());

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _service.GetTodayAttendanceAsync(targetEmployeeId));
        }

        [Fact]
        public async Task ManualAdjustmentAsync_Success()
        {
            // Arrange
            var modifierId = 1;
            var recordId = 100;
            var oldTime = DateTime.UtcNow.AddHours(-1);
            var newTime = DateTime.UtcNow;
            
            var record = new AttendanceRecords { Id = recordId, record_time = oldTime };
            _mockAttendanceRepo.Setup(r => r.GetByIdAsync(recordId)).ReturnsAsync(record);
            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(2); // One for record update, one for log

            var dto = new AttendanceAdjustmentDto { RecordId = recordId, NewTime = newTime, Reason = "Adjusting mistakenly" };

            // Act
            var result = await _service.ManualAdjustmentAsync(modifierId, dto);

            // Assert
            Assert.True(result);
            Assert.Equal(newTime, record.record_time);
            _mockModRepo.Verify(r => r.AddAsync(It.Is<AttendanceModifications>(m => 
                m.attendance_record_id == recordId && 
                m.modified_by == modifierId && 
                m.old_time == oldTime && 
                m.new_time == newTime)), Times.Once);
        }

        [Fact]
        public async Task UpdateEmployeeMachineMappingsAsync_UpsertLogic()
        {
            // Arrange
            var empId = 10;
            var existingMappings = new List<EmployeeTimekeepingMachines>
            {
                new EmployeeTimekeepingMachines { Id = 1, employee_id = empId, machine_id = 1, timekeeping_code = "OLD_CODE" },
                new EmployeeTimekeepingMachines { Id = 2, employee_id = empId, machine_id = 2, timekeeping_code = "STAY_CODE" }
            };
            _mockMachineRepo.Setup(r => r.AsQueryable()).Returns(existingMappings.BuildMock());
            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            var dto = new List<EmployeeMachineMappingDto>
            {
                new EmployeeMachineMappingDto { MachineId = 1, TimekeepingCode = "" }, // Should Delete
                new EmployeeMachineMappingDto { MachineId = 2, TimekeepingCode = "NEW_CODE" }, // Should Update
                new EmployeeMachineMappingDto { MachineId = 3, TimekeepingCode = "BRAND_NEW" } // Should Add
            };

            // Act
            var result = await _service.UpdateEmployeeMachineMappingsAsync(empId, dto);

            // Assert
            Assert.True(result);
            _mockMachineRepo.Verify(r => r.Remove(It.Is<EmployeeTimekeepingMachines>(m => m.Id == 1)), Times.Once);
            _mockMachineRepo.Verify(r => r.Update(It.Is<EmployeeTimekeepingMachines>(m => m.Id == 2 && m.timekeeping_code == "NEW_CODE")), Times.Once);
            _mockMachineRepo.Verify(r => r.AddAsync(It.Is<EmployeeTimekeepingMachines>(m => m.machine_id == 3 && m.timekeeping_code == "BRAND_NEW")), Times.Once);
        }

        [Fact]
        public async Task UpdateEmployeeTimekeepingOptionsAsync_Success_CreateNew()
        {
            // Arrange
            var empId = 10;
            _mockSettingsRepo.Setup(r => r.AsQueryable()).Returns(new List<AttendanceSettings>().BuildMock());
            _mockUserContext.Setup(c => c.TenantId).Returns(1);
            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            var dto = new EmployeeTimekeepingOptionsDto { MultiDeviceLogin = true, TrackLocation = true };

            // Act
            var result = await _service.UpdateEmployeeTimekeepingOptionsAsync(empId, dto);

            // Assert
            Assert.True(result);
            _mockSettingsRepo.Verify(r => r.AddAsync(It.Is<AttendanceSettings>(s => s.employee_id == empId && s.multi_device_login == true)), Times.Once);
        }
    }
}
