using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models.ControlPlane
{
    [Table("Sys_TenantUpgradeRequests")]
    public class TenantUpgradeRequest : AuditableEntity
    {
        [Required]
        public int TenantId { get; set; }

        [Required]
        [StringLength(50)]
        public string TargetPlanCode { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Note { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

        [ForeignKey("TenantId")]
        public virtual Tenants? Tenant { get; set; }
    }
}
