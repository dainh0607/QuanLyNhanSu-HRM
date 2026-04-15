using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    /// <summary>
    /// Maps resources (modules, data) to roles
    /// FIX #5: Define which resources each role can access
    /// Example: C&B can access Payroll, Sales modules
    /// </summary>
    [Table("ResourcePermissions")]
    public class ResourcePermissions : BaseEntity, ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("role_id")]
        public int role_id { get; set; }

        [ForeignKey("role_id")]
        public virtual Roles Role { get; set; }

        /// <summary>
        /// Resource names: Payroll, Sales, Attendance, Contracts, LeaveRequest, etc.
        /// </summary>
        [Column("resource_name")]
        [StringLength(100)]
        public string? resource_name { get; set; }

        /// <summary>
        /// Scope level for this specific resource
        /// TENANT, REGION, BRANCH, DEPARTMENT, PERSONAL
        /// </summary>
        [Column("scope_level")]
        [StringLength(50)]
        public string? scope_level { get; set; }

        [Column("description")]
        [StringLength(500)]
        public string? description { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;

        [Column("created_at")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? updated_at { get; set; }
    }
}
