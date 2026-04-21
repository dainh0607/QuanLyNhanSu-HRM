using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("UserRoles")]
    public class UserRoles : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("id")]
        [Key]
        public int id { get; set; }

        [Column("user_id")]
        public int user_id { get; set; }

        [ForeignKey("user_id")]
        public virtual Users User { get; set; } = null!;

        [Column("role_id")]
        public int role_id { get; set; }

        [ForeignKey("role_id")]
        public virtual Roles Role { get; set; } = null!;

        /// <summary>
        /// FIX #1, #4: Scope constraints for this role assignment
        /// Tenant ID (always set, identifies org)
        /// </summary>
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        /// <summary>
        /// FIX #3: Region scope (NULL means all regions in tenant)
        /// </summary>
        [Column("region_id")]
        public int? region_id { get; set; }

        [ForeignKey("region_id")]
        public virtual Regions? Region { get; set; }

        /// <summary>
        /// FIX #4: Branch scope (NULL means all branches in region/tenant)
        /// </summary>
        [Column("branch_id")]
        public int? branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches? Branch { get; set; }

        /// <summary>
        /// FIX #4: Department scope (NULL means all departments)
        /// </summary>
        [Column("department_id")]
        public int? department_id { get; set; }

        [ForeignKey("department_id")]
        public virtual Departments? Department { get; set; }

        /// <summary>
        /// FIX #13, #14: Time-based role assignment
        /// Start date of this role assignment
        /// </summary>
        [Column("valid_from")]
        public DateTime valid_from { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// FIX #13, #14: Expiry date of this role assignment
        /// NULL means no expiry (permanent assignment)
        /// </summary>
        [Column("valid_to")]
        public DateTime? valid_to { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;

        /// <summary>
        /// FIX #13: Who assigned this role (audit trail)
        /// </summary>
        [Column("assigned_by_user_id")]
        public int? assigned_by_user_id { get; set; }

        [ForeignKey("assigned_by_user_id")]
        public virtual Users? AssignedByUser { get; set; }

        /// <summary>
        /// FIX #13: Reason for assignment (audit trail)
        /// </summary>
        [Column("assignment_reason")]
        [StringLength(500)]
        public string? assignment_reason { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
