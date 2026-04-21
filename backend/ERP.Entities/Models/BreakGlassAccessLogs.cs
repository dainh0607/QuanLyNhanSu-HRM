using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    /// <summary>
    /// Tracks every access to break-glass emergency account
    /// FIX #11: Time-limited access with forced password change
    /// </summary>
    [Table("BreakGlassAccessLogs")]
    public class BreakGlassAccessLogs : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("id")]
        [Key]
        public int id { get; set; }

        [Column("user_id")]
        public int user_id { get; set; }

        [ForeignKey("user_id")]
        public virtual Users User { get; set; } = null!;

        [Column("login_time")]
        public DateTime login_time { get; set; } = DateTime.UtcNow;

        [Column("logout_time")]
        public DateTime? logout_time { get; set; }

        [Column("ip_address")]
        [StringLength(50)]
        public string? ip_address { get; set; }

        [Column("user_agent")]
        [StringLength(500)]
        public string? user_agent { get; set; }

        /// <summary>
        /// What actions were performed during this session
        /// JSON format or comma-separated list of action names
        /// </summary>
        [Column("actions_performed")]
        public string? actions_performed { get; set; }

        /// <summary>
        /// Reason for emergency access (mandatory)
        /// </summary>
        [Column("reason_for_access")]
        [StringLength(500)]
        public string? reason_for_access { get; set; }

        /// <summary>
        /// User ID who approved this emergency access
        /// </summary>
        [Column("approved_by_user_id")]
        public int? approved_by_user_id { get; set; }

        [ForeignKey("approved_by_user_id")]
        public virtual Users? ApprovedByUser { get; set; }

        [Column("approval_time")]
        public DateTime? approval_time { get; set; }

        /// <summary>
        /// Whether password was forced to change after this session
        /// </summary>
        [Column("password_changed_after_access")]
        public bool password_changed_after_access { get; set; } = false;

        [Column("new_password_hash")]
        [StringLength(500)]
        public string? new_password_hash { get; set; }

        [Column("password_change_forced_at")]
        public DateTime? password_change_forced_at { get; set; }

        /// <summary>
        /// Auto-lock this account for future access
        /// </summary>
        [Column("is_account_locked_after")]
        public bool is_account_locked_after { get; set; } = true;

        [Column("created_at")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
