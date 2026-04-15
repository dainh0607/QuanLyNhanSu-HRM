using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("TaxTypes")]
    public class TaxTypes : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("code")]
        [StringLength(50)]
        public string code { get; set; }

        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }
    }
}
