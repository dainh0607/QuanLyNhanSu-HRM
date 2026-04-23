using System;
using System.Collections.Generic;

namespace ERP.DTOs.Tenant
{
    public class TenantSubscriptionDto
    {
        public string PlanName { get; set; } = string.Empty;
        public string PlanCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
        public DateTime NextRenewalAt { get; set; }
        
        // Quota usage
        public int ActiveEmployees { get; set; }
        public int EmployeeLimit { get; set; }
        public double StorageUsedGb { get; set; }
        public int StorageLimitGb { get; set; }
        
        // Features
        public List<string> IncludedModules { get; set; } = new();
    }

    public class UpgradeRequestDto
    {
        public string TargetPlanCode { get; set; } = string.Empty;
        public string? Note { get; set; }
    }
}
