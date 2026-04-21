using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Addresses")]
    public class Addresses : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("address_line")]
        [StringLength(255)]
        public string address_line { get; set; } = null!;

        [Column("ward")]
        [StringLength(100)]
        public string? ward { get; set; }

        [Column("district")]
        [StringLength(100)]
        public string? district { get; set; }

        [Column("city")]
        [StringLength(100)]
        public string? city { get; set; }

        [Column("country")]
        [StringLength(100)]
        public string country { get; set; } = null!;

        [Column("postal_code")]
        [StringLength(20)]
        public string? postal_code { get; set; }
    }
}
