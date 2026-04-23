using System;

namespace ERP.DTOs.Tenant
{
    public class TenantProfileDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string? CompanyEmail { get; set; }
        public DateTime? EstablishmentDate { get; set; }
        public string? CompanySize { get; set; }
        public decimal? CharterCapital { get; set; }
        public string? BankName { get; set; }
        public string? BankAccountNo { get; set; }
        public string? TaxCode { get; set; }
        public string? Address { get; set; }
        public string? CountryCode { get; set; }
        public string? ProvinceCode { get; set; }
        public string? DistrictCode { get; set; }
        public string DateFormat { get; set; } = "DD/MM/YYYY";
        public string TimeFormat { get; set; } = "24H";
        public string? Notes { get; set; }
    }

    public class TenantProfileUpdateDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string? CompanyEmail { get; set; }
        public DateTime? EstablishmentDate { get; set; }
        public string? CompanySize { get; set; }
        public decimal? CharterCapital { get; set; }
        public string? BankName { get; set; }
        public string? BankAccountNo { get; set; }
        public string? TaxCode { get; set; }
        public string? Address { get; set; }
        public string? CountryCode { get; set; }
        public string? ProvinceCode { get; set; }
        public string? DistrictCode { get; set; }
        public string DateFormat { get; set; } = "DD/MM/YYYY";
        public string TimeFormat { get; set; } = "24H";
        public string? Notes { get; set; }
    }
}
