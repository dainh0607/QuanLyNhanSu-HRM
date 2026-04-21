using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Deductions")]
    public class Deductions : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("code")]
        [StringLength(50)]
        public string code { get; set; } = null!;

        [Column("name")]
        [StringLength(100)]
        public string name { get; set; } = null!;

        [Column("type")]
        [StringLength(20)]
        public string type { get; set; } = null!;

        [Column("amount")]
        public decimal? amount { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }
    }
}
