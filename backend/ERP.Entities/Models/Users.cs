using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Users")]
    public class Users : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; } = null!;

        [Column("username")]
        [StringLength(50)]
        public string username { get; set; } = null!;

        [Column("is_active")]
        public bool is_active { get; set; }

        [Column("firebase_uid")]
        [StringLength(128)]
        public string firebase_uid { get; set; } = null!;

        // ========== FIX #1, #11: System Admin vs Tenant Admin roles ==========
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        /// <summary>
        /// FIX #11: Whether this is a break-glass emergency account
        /// </summary>
        [Column("is_break_glass_account")]
        public bool is_break_glass_account { get; set; } = false;

        // ========== FIX #12: Account lockout for brute force protection ==========
        /// <summary>
        /// FIX #12: Whether account is locked due to failed login attempts
        /// </summary>
        [Column("is_locked")]
        public bool is_locked { get; set; } = false;

        [Column("locked_until")]
        public DateTime? locked_until { get; set; }

        [Column("failed_login_count")]
        public int failed_login_count { get; set; } = 0;

        [Column("last_failed_login_time")]
        public DateTime? last_failed_login_time { get; set; }

        // ========== Password policy enforcement ==========
        [Column("last_password_change")]
        public DateTime? last_password_change { get; set; }

        /// <summary>
        /// FIX #15: Track when password must be changed (24 months for break-glass)
        /// </summary>
        [Column("password_expires_at")]
        public DateTime? password_expires_at { get; set; }

        [Column("requires_password_change")]
        public bool requires_password_change { get; set; } = false;

        // ========== Break-glass specific ==========
        /// <summary>
        /// FIX #11: Last time break-glass account was used
        /// </summary>
        [Column("last_emergency_access_at")]
        public DateTime? last_emergency_access_at { get; set; }

        /// <summary>
        /// FIX #11: Must change password after emergency access
        /// </summary>
        [Column("force_password_change_after_emergency")]
        public bool force_password_change_after_emergency { get; set; } = false;
    }
}
