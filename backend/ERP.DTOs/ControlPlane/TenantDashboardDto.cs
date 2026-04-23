using System;

namespace ERP.DTOs.ControlPlane
{
    public class TenantMasterDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string? Subdomain { get; set; }
        public string? OwnerEmail { get; set; }
        public string RentalStatus { get; set; } = null!; // ACTIVE, TRIAL, OVERDUE, SUSPENDED
        public string? PlanName { get; set; }
        public int TotalEmployees { get; set; }
        public double StorageUsagePercentage { get; set; }
        public string SupportAccessStatus { get; set; } = null!; // LOCKED, PENDING, GRANTED
    }

    public class TenantDetailDto : TenantMasterDto
    {
        public string? PlanCode { get; set; }
        public string? OnboardingStatus { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public double StorageUsedGb { get; set; }
        public double StorageLimitGb { get; set; }
        public string? LastInvoiceCode { get; set; }
    }
}
