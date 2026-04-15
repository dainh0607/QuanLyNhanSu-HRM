using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    /// <summary>
    /// Maps CRUD actions on specific resources to roles with scope constraints
    /// FIX #6: Define what action each role can perform on which resource
    /// Example: Regional Manager can CREATE_EMPLOYEE only in same region
    /// </summary>
    [Table("ActionPermissions")]
    public class ActionPermissions : BaseEntity, ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("role_id")]
        public int role_id { get; set; }

        [ForeignKey("role_id")]
        public virtual Roles Role { get; set; }

        /// <summary>
        /// Action: CREATE, READ, UPDATE, DELETE, APPROVE, TRANSFER, etc.
        /// </summary>
        [Column("action")]
        [StringLength(50)]
        public string action { get; set; }

        /// <summary>
        /// Resource: EMPLOYEE, DEPARTMENT, BRANCH, REQUEST, EXPENSE, etc.
        /// </summary>
        [Column("resource")]
        [StringLength(50)]
        public string resource { get; set; }

        /// <summary>
        /// Scope constraint for this action:
        /// SAME_TENANT - within same tenant only
        /// SAME_REGION - within same region
        /// SAME_BRANCH - within same branch
        /// SAME_DEPARTMENT - within same department
        /// CROSS_REGION - across regions (for special roles like Module Admin)
        /// CROSS_BRANCH - across branches but same region
        /// </summary>
        [Column("allowed_scope")]
        [StringLength(50)]
        public string allowed_scope { get; set; }

        /// <summary>
        /// Additional condition (optional)
        /// Example: "amount_limit <= 50000000" for expense approvals
        /// </summary>
        [Column("condition")]
        [StringLength(500)]
        public string? condition { get; set; }

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
