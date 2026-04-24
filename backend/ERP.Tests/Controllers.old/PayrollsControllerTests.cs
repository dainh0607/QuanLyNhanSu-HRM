using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using ERP.API.Controllers;
using ERP.Services.Payroll;
using ERP.DTOs.Payroll;
using ERP.DTOs;

namespace ERP.Tests.Controllers
{
    public class PayrollsControllerTests
    {
        private readonly Mock<IPayrollService> _mockPayrollService;
        private readonly PayrollsController _controller;

        public PayrollsControllerTests()
        {
            _mockPayrollService = new Mock<IPayrollService>();
            _controller = new PayrollsController(_mockPayrollService.Object);
        }

        #region GetPayrollTables Tests

        [Fact]
        public async Task GetPayrollTables_Success_ReturnsOkWithData()
        {
            // Arrange
            var payrollResponse = new PayrollPagedResponseDto
            {
                Total = 2,
                Data = new List<PayrollGroupDto>
                {
                    new PayrollGroupDto
                    {
                        MonthYear = "Tháng 1/2026",
                        Items = new List<PayrollTableDto>
                        {
                            new PayrollTableDto
                            {
                                Id = 1,
                                Name = "Tháng 1/2026",
                                EmployeeCount = 50,
                                Status = "Active"
                            }
                        }
                    }
                }
            };

            _mockPayrollService.Setup(s => s.GetPayrollTablesAsync(0, 10))
                .ReturnsAsync(payrollResponse);

            // Act
            var result = await _controller.GetPayrollTables(0, 10);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            Assert.Equal(200, okResult.StatusCode);
            _mockPayrollService.Verify(s => s.GetPayrollTablesAsync(0, 10), Times.Once);
        }

        [Fact]
        public async Task GetPayrollTables_WithPagination_PassesParametersCorrectly()
        {
            // Arrange
            var response = new PayrollPagedResponseDto { Total = 0, Data = new List<PayrollGroupDto>() };
            _mockPayrollService.Setup(s => s.GetPayrollTablesAsync(20, 50))
                .ReturnsAsync(response);

            // Act
            await _controller.GetPayrollTables(20, 50);

            // Assert
            _mockPayrollService.Verify(s => s.GetPayrollTablesAsync(20, 50), Times.Once);
        }

        [Fact]
        public async Task GetPayrollTables_DefaultParameters_UsesCorrectDefaults()
        {
            // Arrange
            var response = new PayrollPagedResponseDto { Total = 0, Data = new List<PayrollGroupDto>() };
            _mockPayrollService.Setup(s => s.GetPayrollTablesAsync(0, 10))
                .ReturnsAsync(response);

            // Act
            await _controller.GetPayrollTables();

            // Assert
            _mockPayrollService.Verify(s => s.GetPayrollTablesAsync(0, 10), Times.Once);
        }

        [Fact]
        public async Task GetPayrollTables_EmptyResult_ReturnsOkWithEmptyList()
        {
            // Arrange
            var emptyResponse = new PayrollPagedResponseDto { Total = 0, Data = new List<PayrollGroupDto>() };
            _mockPayrollService.Setup(s => s.GetPayrollTablesAsync(0, 10))
                .ReturnsAsync(emptyResponse);

            // Act
            var result = await _controller.GetPayrollTables(0, 10);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        #endregion

        #region GetPayrolls Tests

        [Fact]
        public async Task GetPayrolls_Success_ReturnsPayrollsList()
        {
            // Arrange
            var month = 1;
            var year = 2026;
            var payrollsResponse = new PaginatedListDto<object>(
                new List<object>
                {
                    new { Id = 1, EmployeeName = "Nguyễn Văn A", base_salary = 10000000 },
                    new { Id = 2, EmployeeName = "Trần Thị B", base_salary = 8000000 }
                },
                total: 2,
                pageNumber: 1,
                pageSize: 10
            );

            _mockPayrollService.Setup(s => s.GetPayrollsAsync(month, year, 0, 10))
                .ReturnsAsync(payrollsResponse);

            // Act
            var result = await _controller.GetPayrolls(month, year);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            _mockPayrollService.Verify(s => s.GetPayrollsAsync(month, year, 0, 10), Times.Once);
        }

        [Fact]
        public async Task GetPayrolls_ValidMonthYear_ReturnsCorrectData()
        {
            // Arrange
            var response = new PaginatedListDto<object>(
                new List<object>(),
                total: 0,
                pageNumber: 1,
                pageSize: 10
            );

            _mockPayrollService.Setup(s => s.GetPayrollsAsync(12, 2025, 0, 10))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.GetPayrolls(12, 2025);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetPayrolls_InvalidMonth_ServiceHandles()
        {
            // Arrange
            var response = new PaginatedListDto<object>(
                new List<object>(),
                total: 0,
                pageNumber: 1,
                pageSize: 10
            );

            _mockPayrollService.Setup(s => s.GetPayrollsAsync(13, 2026, 0, 10))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.GetPayrolls(13, 2026);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        #endregion

        #region GetPayrollDetail Tests

        [Fact]
        public async Task GetPayrollDetail_ExistingId_ReturnsPayrollDetail()
        {
            // Arrange
            var payrollId = 1;
            dynamic payrollDetail = new
            {
                Id = payrollId,
                EmployeeName = "Nguyễn Văn A",
                base_salary = 10000000,
                total_allowances = 1000000,
                total_deductions = 2000000,
                net_salary = 9000000,
                status = "Approved"
            };

            _mockPayrollService.Setup(s => s.GetPayrollDetailAsync(payrollId))
                .ReturnsAsync(payrollDetail);

            // Act
            var result = await _controller.GetPayrollDetail(payrollId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            _mockPayrollService.Verify(s => s.GetPayrollDetailAsync(payrollId), Times.Once);
        }

        [Fact]
        public async Task GetPayrollDetail_NonExistingId_ReturnsNotFound()
        {
            // Arrange
            var payrollId = 999;
            _mockPayrollService.Setup(s => s.GetPayrollDetailAsync(payrollId))
                .ReturnsAsync((object)null);

            // Act
            var result = await _controller.GetPayrollDetail(payrollId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundResult>(result);
            Assert.Equal(404, notFoundResult.StatusCode);
        }

        [Fact]
        public async Task GetPayrollDetail_WithCompleteDetails_ReturnsAllData()
        {
            // Arrange
            var payrollId = 1;
            dynamic payrollDetail = new
            {
                Id = payrollId,
                EmployeeName = "Test Employee",
                Department = "IT",
                JobTitle = "Developer",
                base_salary = 10000000,
                total_allowances = 2000000,
                total_deductions = 3000000,
                net_salary = 9000000
            };

            _mockPayrollService.Setup(s => s.GetPayrollDetailAsync(payrollId))
                .ReturnsAsync(payrollDetail);

            // Act
            var result = await _controller.GetPayrollDetail(payrollId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        #endregion

        #region GeneratePayrolls Tests

        [Fact]
        public async Task GeneratePayrolls_Success_ReturnsSuccessMessage()
        {
            // Arrange
            var month = 1;
            var year = 2026;
            _mockPayrollService.Setup(s => s.GeneratePayrollsAsync(month, year))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.GeneratePayrolls(month, year);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            _mockPayrollService.Verify(s => s.GeneratePayrollsAsync(month, year), Times.Once);
        }

        [Fact]
        public async Task GeneratePayrolls_Failure_ReturnsFalse()
        {
            // Arrange
            var month = 1;
            var year = 2026;
            _mockPayrollService.Setup(s => s.GeneratePayrollsAsync(month, year))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.GeneratePayrolls(month, year);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GeneratePayrolls_ValidatesMonthYear()
        {
            // Arrange
            _mockPayrollService.Setup(s => s.GeneratePayrollsAsync(It.IsAny<int>(), It.IsAny<int>()))
                .ReturnsAsync(true);

            // Act
            await _controller.GeneratePayrolls(6, 2026);

            // Assert
            _mockPayrollService.Verify(s => s.GeneratePayrollsAsync(6, 2026), Times.Once);
        }

        #endregion

        #region ApprovePayroll Tests

        [Fact]
        public async Task ApprovePayroll_Success_ReturnsOk()
        {
            // Arrange
            var payrollId = 1;
            _mockPayrollService.Setup(s => s.ApprovePayrollAsync(payrollId, It.IsAny<int>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.ApprovePayroll(payrollId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            _mockPayrollService.Verify(s => s.ApprovePayrollAsync(payrollId, It.IsAny<int>()), Times.Once);
        }

        [Fact]
        public async Task ApprovePayroll_PayrollNotFound_ReturnsFalse()
        {
            // Arrange
            var payrollId = 999;
            _mockPayrollService.Setup(s => s.ApprovePayrollAsync(payrollId, It.IsAny<int>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.ApprovePayroll(payrollId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        #endregion

        #region DeletePayroll Tests

        [Fact]
        public async Task DeletePayroll_Success_ReturnsOkWithMessage()
        {
            // Arrange
            var payrollId = 1;
            _mockPayrollService.Setup(s => s.DeletePayrollTableAsync(payrollId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeletePayroll(payrollId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
            _mockPayrollService.Verify(s => s.DeletePayrollTableAsync(payrollId), Times.Once);
        }

        [Fact]
        public async Task DeletePayroll_NotFound_ReturnsNotFound()
        {
            // Arrange
            var payrollId = 999;
            _mockPayrollService.Setup(s => s.DeletePayrollTableAsync(payrollId))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeletePayroll(payrollId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundResult>(result);
            Assert.Equal(404, notFoundResult.StatusCode);
        }

        [Fact]
        public async Task DeletePayroll_InvalidStatus_ReturnsBadRequest()
        {
            // Arrange
            var payrollId = 1;
            _mockPayrollService.Setup(s => s.DeletePayrollTableAsync(payrollId))
                .ThrowsAsync(new InvalidOperationException("Chỉ có thể xóa bảng lương ở trạng thái Bản nháp."));

            // Act
            var result = await _controller.DeletePayroll(payrollId);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
        }

        [Fact]
        public async Task DeletePayroll_DifferentPayrolls_DeletesCorrectOne()
        {
            // Arrange
            var payrollId1 = 1;
            var payrollId2 = 2;

            _mockPayrollService.Setup(s => s.DeletePayrollTableAsync(payrollId1))
                .ReturnsAsync(true);

            _mockPayrollService.Setup(s => s.DeletePayrollTableAsync(payrollId2))
                .ReturnsAsync(true);

            // Act
            var result1 = await _controller.DeletePayroll(payrollId1);
            var result2 = await _controller.DeletePayroll(payrollId2);

            // Assert
            Assert.IsType<OkObjectResult>(result1);
            Assert.IsType<OkObjectResult>(result2);
            _mockPayrollService.Verify(s => s.DeletePayrollTableAsync(payrollId1), Times.Once);
            _mockPayrollService.Verify(s => s.DeletePayrollTableAsync(payrollId2), Times.Once);
        }

        #endregion
    }
}
