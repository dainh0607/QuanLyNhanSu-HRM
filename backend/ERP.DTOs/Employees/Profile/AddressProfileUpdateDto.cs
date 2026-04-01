using System.Collections.Generic;

namespace ERP.DTOs.Employees.Profile
{
    public class AddressProfileUpdateDto
    {
        public string? OriginPlace { get; set; }
        
        // AC 3.1: Permanent Address (Địa chỉ thường trú)
        public AddressDto PermanentAddress { get; set; } = new();

        // AC 3.1: Merged Address (Địa chỉ sát nhập)
        public AddressDto MergedAddress { get; set; } = new();

        // AC 3.2: Current Address (Địa chỉ hiện tại)
        public string? CurrentAddress { get; set; }

        // Generic collection for other types (Temporary, etc.)
        public List<EmployeeAddressDto> AdditionalAddresses { get; set; } = new();
    }
}
