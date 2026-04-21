using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using ERP.Services.Contracts;
using ERP.Repositories.Interfaces;
using ERP.Entities.Models;
using ERP.DTOs.Contracts;
using MockQueryable.Moq;
using MockQueryable;
using ERP.Services.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using ERP.Services.Employees;

namespace ERP.Tests.Services.Contracts
{
    public class ContractServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUow;
        private readonly Mock<IGenericRepository<ERP.Entities.Models.Contracts>> _mockContractRepo;
        private readonly Mock<IGenericRepository<ContractSigners>> _mockSignerRepo;
        private readonly Mock<IGenericRepository<ContractSignerPositions>> _mockPositionRepo;

        private readonly Mock<IPdfService> _mockPdfService;
        private readonly Mock<IWebHostEnvironment> _mockEnvironment;
        private readonly Mock<IStorageService> _mockStorageService;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IContractNotificationService> _mockNotificationService;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Mock<IEmploymentHistoryService> _mockHistoryService;

        private readonly ContractService _service;

        public ContractServiceTests()
        {
            _mockUow = new Mock<IUnitOfWork>();
            _mockContractRepo = new Mock<IGenericRepository<ERP.Entities.Models.Contracts>>();
            _mockSignerRepo = new Mock<IGenericRepository<ContractSigners>>();
            _mockPositionRepo = new Mock<IGenericRepository<ContractSignerPositions>>();

            _mockUow.Setup(u => u.Repository<ERP.Entities.Models.Contracts>()).Returns(_mockContractRepo.Object);
            _mockUow.Setup(u => u.Repository<ContractSigners>()).Returns(_mockSignerRepo.Object);
            _mockUow.Setup(u => u.Repository<ContractSignerPositions>()).Returns(_mockPositionRepo.Object);

            _mockPdfService = new Mock<IPdfService>();
            _mockEnvironment = new Mock<IWebHostEnvironment>();
            _mockStorageService = new Mock<IStorageService>();
            _mockEmailService = new Mock<IEmailService>();
            _mockNotificationService = new Mock<IContractNotificationService>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockHistoryService = new Mock<IEmploymentHistoryService>();

            _service = new ContractService(
                _mockUow.Object,
                _mockPdfService.Object,
                _mockEnvironment.Object,
                _mockStorageService.Object,
                _mockEmailService.Object,
                _mockNotificationService.Object,
                _mockConfiguration.Object,
                _mockHistoryService.Object
            );
        }

        [Fact]
        public async Task CreateAsync_Fail_DuplicateContractNumber()
        {
            // Arrange
            var existingContract = new ERP.Entities.Models.Contracts { Id = 1, contract_number = "HD-123" };
            var contractsList = new List<ERP.Entities.Models.Contracts> { existingContract };

            _mockContractRepo.Setup(r => r.AsQueryable()).Returns(contractsList.BuildMock());

            var dto = new ContractCreateDto
            {
                ContractNumber = "HD-123",
                EmployeeId = 1,
                ContractTypeId = 1,
                EffectiveDate = DateTime.Today
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.CreateAsync(dto));
            Assert.Contains("đã tồn tại trên hệ thống", ex.Message);
        }

        [Fact]
        public async Task CreateAsync_Fail_OverlappingDates()
        {
            // Arrange
            // Empty queryable for duplicate checking
            _mockContractRepo.Setup(r => r.AsQueryable()).Returns(new List<ERP.Entities.Models.Contracts>().BuildMock());

            var existingContract = new ERP.Entities.Models.Contracts
            {
                Id = 1,
                employee_id = 1,
                effective_date = new DateTime(2026, 1, 1),
                expiry_date = new DateTime(2026, 12, 31),
                status = "Active"
            };

            _mockContractRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ERP.Entities.Models.Contracts, bool>>>()))
                .ReturnsAsync(new List<ERP.Entities.Models.Contracts> { existingContract });

            var dto = new ContractCreateDto
            {
                ContractNumber = "HD-002",
                EmployeeId = 1,
                ContractTypeId = 1,
                SignDate = new DateTime(2026, 5, 1),
                EffectiveDate = new DateTime(2026, 5, 1),
                ExpiryDate = new DateTime(2027, 5, 1)
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.CreateAsync(dto));
            Assert.Contains("hiệu lực trong khoảng thời gian", ex.Message);
        }

        [Fact]
        public async Task CreateAsync_Success()
        {
            // Arrange
            _mockContractRepo.Setup(r => r.AsQueryable()).Returns(new List<ERP.Entities.Models.Contracts>().BuildMock());
            _mockContractRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ERP.Entities.Models.Contracts, bool>>>()))
                .ReturnsAsync(new List<ERP.Entities.Models.Contracts>());

            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            var dto = new ContractCreateDto
            {
                ContractNumber = "HD-NEW",
                EmployeeId = 1,
                ContractTypeId = 1,
                SignDate = new DateTime(2026, 1, 1),
                EffectiveDate = new DateTime(2026, 1, 1),
                ExpiryDate = new DateTime(2027, 1, 1)
            };

            // Act
            var result = await _service.CreateAsync(dto);

            // Assert
            Assert.True(result);
            _mockContractRepo.Verify(r => r.AddAsync(It.Is<ERP.Entities.Models.Contracts>(c => c.contract_number == "HD-NEW" && c.status == "Draft")), Times.Once);
        }

        [Fact]
        public async Task CreateElectronicDraftAsync_Success()
        {
            // Arrange
            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            
            var dto = new ElectronicContractDraftDto
            {
                EmployeeId = 1,
                ContractTypeId = 1,
                Note = "Draft step 1"
            };

            // Act
            var id = await _service.CreateElectronicDraftAsync(dto);

            // Assert
            _mockContractRepo.Verify(r => r.AddAsync(It.Is<ERP.Entities.Models.Contracts>(c => c.is_electronic && c.status == "Draft" && c.contract_number.StartsWith("DRAFT-"))), Times.Once);
        }

        [Fact]
        public async Task SaveElectronicSignersAsync_Success()
        {
            // Arrange
            var contractId = 10;
            var existingContract = new ERP.Entities.Models.Contracts
            {
                Id = contractId,
                is_electronic = true,
                Signers = new List<ContractSigners>
                {
                    new ContractSigners { Id = 1, contract_id = contractId }
                }
            };

            _mockContractRepo.Setup(r => r.AsQueryable()).Returns(new List<ERP.Entities.Models.Contracts> { existingContract }.BuildMock());
            
            // For returning signers at the end
            var dummySignersList = new List<ContractSigners>
            {
                new ContractSigners { Id = 2, contract_id = contractId, sign_order = 1, full_name = "New Signer" }
            };
            _mockSignerRepo.Setup(r => r.AsQueryable()).Returns(dummySignersList.BuildMock());

            _mockUow.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            var dto = new ContractStep3Dto
            {
                ContractId = contractId,
                Signers = new List<ContractSignerDto>
                {
                    new ContractSignerDto { Email = "test@abc.com", FullName = "New Signer", SignOrder = 1 }
                }
            };

            // Act
            var result = await _service.SaveElectronicSignersAsync(dto);

            // Assert
            _mockSignerRepo.Verify(r => r.Remove(It.IsAny<ContractSigners>()), Times.Once); // Removed 1 existing
            _mockSignerRepo.Verify(r => r.AddAsync(It.Is<ContractSigners>(s => s.email == "test@abc.com")), Times.Once); // Added 1 new
            Assert.Single(result);
            Assert.Equal("New Signer", result.First().FullName);
        }
    }
}
