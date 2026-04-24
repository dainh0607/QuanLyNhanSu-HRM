using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    [Table("FeaturePermissions")]
    public class FeaturePermissions : AuditableEntity, ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("role_id")]
        public int role_id { get; set; }

        [ForeignKey("role_id")]
        public virtual Roles Role { get; set; }

        [Column("feature_code")]
        [StringLength(100)]
        public string feature_code { get; set; }

        [Column("is_granted")]
        public bool is_granted { get; set; } = true;

        [Column("description")]
        [StringLength(255)]
        public string? description { get; set; }
    }
}
