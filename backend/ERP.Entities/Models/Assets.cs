using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Assets")]
    public class Assets : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("asset_code")]
        [StringLength(50)]
        public string asset_code { get; set; } = null!;

        [Column("asset_name")]
        [StringLength(200)]
        public string asset_name { get; set; } = null!;

        [Column("description")]
        public string? description { get; set; }

        [Column("total_quantity")]
        public int total_quantity { get; set; }
    }
}
