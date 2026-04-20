using System;
using System.Collections.Generic;

namespace ERP.DTOs.Employees.Profile
{
    public class InsuranceDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public string? EmployeeCode { get; set; }
        
        // Common Info
        public string? SocialInsuranceNo { get; set; }
        public string? HealthInsuranceNo { get; set; }
        public bool IsBookSubmitted { get; set; }
        public string? Position { get; set; }
        public string? MedicalHistory { get; set; }
        public string? MaternityRegime { get; set; }
        public string? RegistrationPlace { get; set; }
        public DateTime? JoinDate { get; set; }
        public decimal? SalaryForInsurance { get; set; }
        public decimal? UnionFee { get; set; }
        
        // Context Fields (Read-only)
        public string? GenderName { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? IdentityNumber { get; set; }

        // Address blocks
        public AddressDto? BirthPlaceAddress { get; set; }
        public AddressDto? ResidenceAddress { get; set; }
        public AddressDto? ContactAddress { get; set; }

        // Contribution Rates
        public InsuranceContributionDto CompanyContributions { get; set; } = new();
        public InsuranceContributionDto EmployeeContributions { get; set; } = new();

        public string? Note { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class InsuranceContributionDto
    {
        public decimal? SocialRate { get; set; }
        public decimal? HealthRate { get; set; }
        public decimal? UnemploymentRate { get; set; }
    }

    public class InsuranceListItemDto
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? SocialInsuranceNo { get; set; }
        public string? HealthInsuranceNo { get; set; }
        public DateTime? JoinDate { get; set; }
    }

    public class InsuranceCreateDto
    {
        public int EmployeeId { get; set; }
        public string? SocialInsuranceNo { get; set; }
        public string? HealthInsuranceNo { get; set; }
        public bool IsBookSubmitted { get; set; }
        public string? Position { get; set; }
        public string? MedicalHistory { get; set; }
        public string? MaternityRegime { get; set; }
        public string? RegistrationPlace { get; set; }
        public DateTime? JoinDate { get; set; }
        public decimal? SalaryForInsurance { get; set; }
        public decimal? UnionFee { get; set; }

        public AddressDto? BirthPlaceAddress { get; set; }
        public AddressDto? ResidenceAddress { get; set; }
        public AddressDto? ContactAddress { get; set; }

        public InsuranceContributionDto? CompanyContributions { get; set; }
        public InsuranceContributionDto? EmployeeContributions { get; set; }

        public string? Note { get; set; }
    }
}
