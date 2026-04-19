using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    /// <summary>
    /// Tracks login attempts for rate limiting and brute-force protection
    /// FIX #12: Prevent brute force attacks with account lockout
    /// </summary>
    [Table("LoginAttempts")]
    public class LoginAttempts : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("id")]
        [Key]
        public int id { get; set; }

        [Column("user_id")]
        public int user_id { get; set; }

        [ForeignKey("user_id")]
        public virtual Users User { get; set; }

        [Column("attempt_time")]
        public DateTime attempt_time { get; set; } = DateTime.UtcNow;

        [Column("ip_address")]
        [StringLength(50)]
        public string? ip_address { get; set; }

        [Column("username_attempted")]
        [StringLength(100)]
        public string? username_attempted { get; set; }

        /// <summary>
        /// SUCCESS = 1, FAILED = 0
        /// </summary>
        [Column("is_success")]
        public bool is_success { get; set; }

        [Column("reason_for_failure")]
        [StringLength(255)]
        public string? reason_for_failure { get; set; } // "Invalid password", "Account locked", etc.

        [Column("user_agent")]
        [StringLength(500)]
        public string? user_agent { get; set; }

        /// <summary>
        /// Consecutive failed attempts count at time of this attempt
        /// </summary>
        [Column("failed_attempt_count")]
        public int failed_attempt_count { get; set; } = 0;

        /// <summary>
        /// Whether account was locked due to too many failed attempts
        /// </summary>
        [Column("triggered_account_lockout")]
        public bool triggered_account_lockout { get; set; } = false;

        [Column("locked_until")]
        public DateTime? locked_until { get; set; }

        [Column("created_at")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
