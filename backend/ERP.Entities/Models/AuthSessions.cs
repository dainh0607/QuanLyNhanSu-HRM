using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AuthSessions")]
    public class AuthSessions : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("user_id")]
        public int user_id { get; set; }

        [ForeignKey("user_id")]
        public virtual Users User { get; set; } = null!;

        [Column("session_id")]
        [StringLength(64)]
        public string session_id { get; set; } = null!;

        [Column("refresh_token_hash")]
        [StringLength(128)]
        public string refresh_token_hash { get; set; } = null!;

        [Column("csrf_token_hash")]
        [StringLength(128)]
        public string csrf_token_hash { get; set; } = null!;

        [Column("expires_at")]
        public DateTime expires_at { get; set; }

        [Column("last_used_at")]
        public DateTime? last_used_at { get; set; }

        [Column("revoked_at")]
        public DateTime? revoked_at { get; set; }

        [Column("replaced_by_session_id")]
        [StringLength(64)]
        public string? replaced_by_session_id { get; set; }

        [Column("ip_address")]
        [StringLength(128)]
        public string? ip_address { get; set; }

        [Column("user_agent")]
        [StringLength(512)]
        public string? user_agent { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }
    }
}
