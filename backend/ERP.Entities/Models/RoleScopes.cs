using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    /// <summary>
    /// Maps roles to their scope levels (Tenant, Region, Branch, Department)
    /// FIX #1: Define clear scope boundaries for each role
    /// </summary>
    [Table("RoleScopes")]
    public class RoleScopes : BaseEntity, ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("role_id")]
        public int role_id { get; set; }

        [ForeignKey("role_id")]
        public virtual Roles Role { get; set; }

        /// <summary>
        /// Global scope level for this role:
        /// TENANT (full access), REGION (cross-branch within region), BRANCH (within single branch),
        /// DEPARTMENT (within single dept), PERSONAL (own data only)
        /// </summary>
        [Column("scope_level")]
        [StringLength(50)]
        public string scope_level { get; set; }

        /// <summary>
        /// Whether this role can see children units (e.g., Branch Manager sees all Departments)
        /// </summary>
        [Column("is_hierarchical")]
        public bool is_hierarchical { get; set; } = true;

        /// <summary>
        /// For special Module Admins who might have cross-regional access to specific modules
        /// CSV of module names like "Payroll,Attendance"
        /// </summary>
        [Column("cross_region_modules")]
        [StringLength(500)]
        public string? cross_region_modules { get; set; }

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
