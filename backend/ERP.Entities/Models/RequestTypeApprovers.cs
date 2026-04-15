using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    /// <summary>
    /// Defines approval chain for each request type by role and levels
    /// FIX #7: Define which role approves which request type at which level
    /// Example: EXPENSE requires approval from BranchManager(level 1) then RegionalManager(level 2)
    /// </summary>
    [Table("RequestTypeApprovers")]
    public class RequestTypeApprovers : BaseEntity, ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }
        [Column("request_type_id")]
        public int request_type_id { get; set; }

        [ForeignKey("request_type_id")]
        public virtual RequestTypes RequestType { get; set; }

        [Column("role_id")]
        public int role_id { get; set; }

        [ForeignKey("role_id")]
        public virtual Roles Role { get; set; }

        /// <summary>
        /// Level in approval chain (1 = first approver, 2 = second, etc.)
        /// </summary>
        [Column("approval_level")]
        public int approval_level { get; set; }

        /// <summary>
        /// Max amount that this role can approve at this level
        /// NULL = unlimited, or scope-based (e.g., their branch/region only)
        /// </summary>
        [Column("max_approval_amount")]
        public decimal? max_approval_amount { get; set; }

        /// <summary>
        /// Max duration (days) that this role can approve
        /// Example: Department Manager can only approve up to 2 days leave
        /// </summary>
        [Column("max_approval_days")]
        public int? max_approval_days { get; set; }

        /// <summary>
        /// Whether this approval is required or optional
        /// </summary>
        [Column("is_mandatory")]
        public bool is_mandatory { get; set; } = true;

        /// <summary>
        /// Whether system should auto-approve if amount/days under limit
        /// </summary>
        [Column("auto_approve_when_under_threshold")]
        public bool auto_approve_when_under_threshold { get; set; } = false;

        /// <summary>
        /// Scope for this approver:
        /// SAME_REGION, SAME_BRANCH, PERSONAL, etc.
        /// </summary>
        [Column("approver_scope")]
        [StringLength(50)]
        public string? approver_scope { get; set; }

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
