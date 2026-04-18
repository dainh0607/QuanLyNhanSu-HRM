using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using ERP.Services.Employees;
using ERP.Repositories.Interfaces;
using ERP.Entities.Models;
using ERP.DTOs.Employees.Profile;
using ERP.Services.Authorization;
using ERP.Entities.Interfaces;
using MockQueryable.Moq;
using MockQueryable;
using ERP.Services.Common;

namespace ERP.Tests.Services.EmployeeProfiles
{
    public class EmployeeProfileServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IGenericRepository<ERP.Entities.Models.Employees>> _mockEmpRepo;
        private readonly Mock<IGenericRepository<BankAccounts>> _mockBankRepo;
        private readonly Mock<IGenericRepository<EmergencyContacts>> _mockEmergencyRepo;
        private readonly Mock<IAuthorizationService> _mockAuthService;
        private readonly Mock<ICurrentUserContext> _mockUserContext;
        private readonly Mock<IStorageService> _mockStorageService;

        private readonly EmployeeProfileService _service;

        public EmployeeProfileServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockEmpRepo = new Mock<IGenericRepository<ERP.Entities.Models.Employees>>();
            _mockBankRepo = new Mock<IGenericRepository<BankAccounts>>();
            _mockEmergencyRepo = new Mock<IGenericRepository<EmergencyContacts>>();

            _mockUow.Setup(u => u.Repository<ERP.Entities.Models.Employees>()).Returns(_mockEmpRepo.Object);
            _mockUow.Setup(u => u.Repository<BankAccounts>()).Returns(_mockBankRepo.Object);
            _mockUow.Setup(u => u.Repository<EmergencyContacts>()).Returns(_mockEmergencyRepo.Object);

            _mockAuthService = new Mock<IAuthorizationService>();
            _mockUserContext = new Mock<ICurrentUserContext>();
            _mockStorageService = new Mock<IStorageService>();

            // Allow access by default
            _mockUserContext.Setup(u => u.UserId).Returns(1);
            _mockAuthService.Setup(a => a.CanAccessEmployee(It.IsAny<int>(), It.IsAny<int>())).ReturnsAsync(true);

            _service = new EmployeeProfileService(_mockUow.Object, _mockAuthService.Object, _mockUserContext.Object, _mockStorageService.Object);
        }

        [Fact]
        public async Task UpdateBasicInfoAsync_Fail_EmployeeCodeNull()
        {
            // Arrange
            _mockEmpRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new ERP.Entities.Models.Employees { Id = 1 });

            var dto = new BasicInfoDto { EmployeeCode = "" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateBasicInfoAsync(1, dto));
            Assert.Contains("Mã nhân viên là bắt buộc", ex.Message);
        }

        [Fact]
        public async Task UpdateBasicInfoAsync_Fail_DuplicateCode()
        {
            // Arrange
            _mockEmpRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new ERP.Entities.Models.Employees { Id = 1 });
            
            var existingOthers = new List<ERP.Entities.Models.Employees>
            {
                new ERP.Entities.Models.Employees { Id = 2, employee_code = "EMP-001" }
            };
            
            // Note: EmployeeProfileService uses FindAsync with expression
            _mockEmpRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ERP.Entities.Models.Employees, bool>>>()))
                .ReturnsAsync(existingOthers);

            var dto = new BasicInfoDto { EmployeeCode = "EMP-001" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _service.UpdateBasicInfoAsync(1, dto));
            Assert.Contains("đã tồn tại", ex.Message);
        }

        [Fact]
        public async Task UpdateBasicInfoAsync_Success()
        {
            // Arrange
            var empToUpdate = new ERP.Entities.Models.Employees { Id = 1, employee_code = "OLD-01" };
            _mockEmpRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(empToUpdate);
            _mockEmpRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ERP.Entities.Models.Employees, bool>>>()))
                .ReturnsAsync(new List<ERP.Entities.Models.Employees>());

            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            var dto = new BasicInfoDto
            {
                EmployeeCode = "NEW-01",
                FullName = "Test Employee",
                GenderCode = "MALE"
            };

            // Act
            var result = await _service.UpdateBasicInfoAsync(1, dto);

            // Assert
            Assert.True(result);
            _mockEmpRepo.Verify(r => r.Update(It.Is<ERP.Entities.Models.Employees>(e => e.employee_code == "NEW-01" && e.gender_code == "MALE")), Times.Once);
        }

        [Fact]
        public async Task UpdateBankAccountsAsync_Success()
        {
            // Arrange
            var existingBanks = new List<BankAccounts>
            {
                new BankAccounts { Id = 10, employee_id = 1 }
            };
            _mockBankRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<BankAccounts, bool>>>()))
                .ReturnsAsync(existingBanks);

            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            var dtos = new List<BankAccountDto>
            {
                new BankAccountDto { AccountHolder = "Nguyen Van A", AccountNumber = "12345", BankName = "VCB" }
            };

            // Act
            var result = await _service.UpdateBankAccountsAsync(1, dtos);

            // Assert
            Assert.True(result);
            _mockBankRepo.Verify(r => r.RemoveRange(existingBanks), Times.Once); // Should delete existing
            _mockBankRepo.Verify(r => r.AddRangeAsync(It.Is<IEnumerable<BankAccounts>>(l => l.First().bank_name == "VCB")), Times.Once);
        }

        [Fact]
        public async Task UpdateOtherInfoAsync_Success()
        {
            // Arrange
            var empToUpdate = new ERP.Entities.Models.Employees { Id = 1 };
            _mockEmpRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(empToUpdate);
            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            var dto = new OtherInfoDto
            {
                UnionGroup = "IT Union",
                TaxCode = "12345",
                MaritalStatusCode = "MARRIED"
            };

            // Act
            var result = await _service.UpdateOtherInfoAsync(1, dto);

            // Assert
            Assert.True(result);
            _mockEmpRepo.Verify(r => r.Update(It.Is<ERP.Entities.Models.Employees>(e => e.union_group == "IT Union" && e.union_member == true && e.tax_code == "12345" && e.marital_status_code == "MARRIED")), Times.Once);
        }
    }
}
