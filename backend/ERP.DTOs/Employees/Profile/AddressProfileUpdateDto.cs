using System.Collections.Generic;

namespace ERP.DTOs.Employees.Profile
{
    public class AddressProfileUpdateDto
    {
        public string? OriginPlace { get; set; }
        public List<EmployeeAddressDto> Addresses { get; set; } = new();
    }
}
