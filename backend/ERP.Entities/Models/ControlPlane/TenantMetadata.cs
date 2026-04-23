using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models.ControlPlane
{
    [Table("TenantMetadata")]
    public class TenantMetadata : AuditableEntity
    {
        [Column("tenant_id")]
        public int tenant_id { get; set; }

        [ForeignKey("tenant_id")]
        public virtual Tenants Tenant { get; set; }

        [Column("total_employees")]
        public int total_employees { get; set; }

        [Column("storage_usage_bytes")]
        public long storage_usage_bytes { get; set; }

        [Column("max_storage_quota_bytes")]
        public long max_storage_quota_bytes { get; set; }

        [Column("rental_status")]
        [StringLength(20)]
        public string rental_status { get; set; } = "ACTIVE"; // ACTIVE, TRIAL, OVERDUE, SUSPENDED

        [Column("subscription_plan_name")]
        [StringLength(50)]
        public string? subscription_plan_name { get; set; }

        [Column("last_invoice_code")]
        [StringLength(50)]
        public string? last_invoice_code { get; set; }

        [Column("support_access_status")]
        [StringLength(50)]
        public string support_access_status { get; set; } = "LOCKED"; // LOCKED, PENDING, GRANTED

        [Column("last_sync_at")]
        public DateTime last_sync_at { get; set; }
    }
}
