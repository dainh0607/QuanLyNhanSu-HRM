using Xunit;
using ERP.Entities.Models;

namespace ERP.Tests
{
    public class EntityTests
    {
        [Fact]
        public void Employee_ShouldCreateWithCorrectData()
        {
            // Arrange
            var employee = new Employees
            {
                Id = 1,
                full_name = "Nguyen Van A",
                email = "test@example.com"
            };

            // Act & Assert
            Assert.Equal(1, employee.Id);
            Assert.Equal("Nguyen Van A", employee.full_name);
            Assert.Equal("test@example.com", employee.email);
        }
    }
}
