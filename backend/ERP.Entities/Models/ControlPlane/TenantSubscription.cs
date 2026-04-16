using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models.ControlPlane
{
    [Table("Sys_TenantSubscriptions")]
    public class TenantSubscription
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int TenantId { get; set; }

        [Required]
        public int PlanId { get; set; }

        [Required]
        [StringLength(100)]
        public string SubscriptionCode { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "trial"; // "trial", "active", "past_due", "suspended"

        [Required]
        [StringLength(50)]
        public string OnboardingStatus { get; set; } = "setup_in_progress"; // "awaiting_contract", "setup_in_progress", "ready", "trial"

        [Required]
        [StringLength(20)]
        public string BillingCycle { get; set; } = "monthly"; // "monthly", "quarterly", "yearly"

        public DateTime NextRenewalAt { get; set; }

        [StringLength(100)]
        public string? LastInvoiceCode { get; set; }

        [Required]
        [StringLength(50)]
        public string BillingStatus { get; set; } = "draft"; // "paid", "upcoming", "overdue", "draft"

        public float StorageUsedGb { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        [ForeignKey("TenantId")]
        public Tenants? Tenant { get; set; }

        [ForeignKey("PlanId")]
        public SubscriptionPlan? Plan { get; set; }
    }
}
