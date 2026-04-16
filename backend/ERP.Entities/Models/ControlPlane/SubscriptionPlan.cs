using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models.ControlPlane
{
    [Table("Sys_SubscriptionPlans")]
    public class SubscriptionPlan
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlyPriceVnd { get; set; }

        public int StorageLimitGb { get; set; }

        public int EmployeeSeatLimit { get; set; }

        public int AdminSeatLimit { get; set; }

        public string? Modules { get; set; } // Trực tiếp lưu JSON array, e.g. ["payroll", "attendance"]
        
        [StringLength(100)]
        public string? Highlight { get; set; }
        
        [StringLength(500)]
        public string? SupportSla { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation Properties
        public ICollection<TenantSubscription> TenantSubscriptions { get; set; } = new List<TenantSubscription>();
    }
}
