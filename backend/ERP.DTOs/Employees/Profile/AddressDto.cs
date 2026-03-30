using System;

namespace ERP.DTOs.Employees.Profile
{
    public class AddressDto
    {
        public int Id { get; set; }
        public string AddressLine { get; set; }
        public string Ward { get; set; }
        public string District { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string PostalCode { get; set; }
    }

    public class EmployeeAddressDto
    {
        public int AddressId { get; set; }
        public AddressDto Address { get; set; }
        public int AddressTypeId { get; set; }
        public string? AddressTypeName { get; set; }
        public bool IsCurrent { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
