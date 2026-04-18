using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("WorkspaceInvitations")]
    public class WorkspaceInvitations : BaseEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("company_name")]
        [MaxLength(300)]
        public string company_name { get; set; } = string.Empty;

        [Column("workspace_code")]
        [MaxLength(50)]
        public string workspace_code { get; set; } = string.Empty;

        [Column("owner_full_name")]
        [MaxLength(200)]
        public string owner_full_name { get; set; } = string.Empty;

        [Column("owner_email")]
        [MaxLength(200)]
        public string owner_email { get; set; } = string.Empty;

        [Column("owner_phone")]
        [MaxLength(50)]
        public string owner_phone { get; set; } = string.Empty;

        [Column("plan_name")]
        [MaxLength(100)]
        public string plan_name { get; set; } = string.Empty;

        [Column("plan_code")]
        [MaxLength(50)]
        public string plan_code { get; set; } = string.Empty;

        [Column("activation_token")]
        [MaxLength(500)]
        public string activation_token { get; set; } = string.Empty;

        [Column("status")]
        [MaxLength(20)]
        public string status { get; set; } = "invited";

        [Column("invited_by")]
        [MaxLength(200)]
        public string invited_by { get; set; } = string.Empty;

        [Column("invited_at")]
        public DateTime? invited_at { get; set; }

        [Column("expires_at")]
        public DateTime? expires_at { get; set; }

        [Column("activated_at")]
        public DateTime? activated_at { get; set; }

        [Column("revoked_at")]
        public DateTime? revoked_at { get; set; }

        [Column("note")]
        public string? note { get; set; }
    }
}
