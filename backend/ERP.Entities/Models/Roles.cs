using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    [Table("Roles")]
    public class Roles : AuditableEntity, ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("is_system_role")]
        public bool is_system_role { get; set; }
        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }

        [Column("description")]
        [StringLength(255)]
        public string description { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }
    }
}
