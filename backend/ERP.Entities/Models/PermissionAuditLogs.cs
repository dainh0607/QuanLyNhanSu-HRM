using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    /// <summary>
    /// Immutable audit log for permission changes
    /// FIX #10: Track who changed what permissions when
    /// CRITICAL: This table should NEVER allow DELETE
    /// </summary>
    [Table("PermissionAuditLogs")]
    public class PermissionAuditLogs : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("id")]
        [Key]
        public int id { get; set; }

        [Column("action_type")]
        [StringLength(50)]
        public string? action_type { get; set; } // ASSIGN_ROLE, REVOKE_ROLE, CHANGE_SCOPE, etc.

        [Column("target_user_id")]
        public int target_user_id { get; set; }

        [ForeignKey("target_user_id")]
        public virtual Users TargetUser { get; set; }

        [Column("performed_by_user_id")]
        public int performed_by_user_id { get; set; }

        [ForeignKey("performed_by_user_id")]
        public virtual Users PerformedByUser { get; set; }

        [Column("role_id")]
        public int? role_id { get; set; }

        [ForeignKey("role_id")]
        public virtual Roles Role { get; set; }

        [Column("old_role_id")]
        public int? old_role_id { get; set; }

        /// <summary>
        /// Scope info: Region ID, Branch ID, Department ID
        /// Format: "region_id:5,branch_id:10,department_id:NULL"
        /// </summary>
        [Column("scope_details")]
        [StringLength(500)]
        public string? scope_details { get; set; }

        [Column("old_scope_details")]
        [StringLength(500)]
        public string? old_scope_details { get; set; }

        [Column("reason")]
        [StringLength(500)]
        public string? reason { get; set; }

        [Column("ip_address")]
        [StringLength(50)]
        public string? ip_address { get; set; }

        [Column("user_agent")]
        [StringLength(500)]
        public string? user_agent { get; set; }

        [Column("created_at")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        // Ensure this record cannot be modified or deleted
        [Column("is_immutable")]
        public bool is_immutable { get; set; } = true;
    }
}
