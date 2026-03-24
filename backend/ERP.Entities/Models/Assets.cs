using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Assets")]
    public class Assets : BaseEntity
    {
        [Column("asset_code")]
        [StringLength(50)]
        public string asset_code { get; set; }

        [Column("asset_name")]
        [StringLength(200)]
        public string asset_name { get; set; }

        [Column("description")]
        public string description { get; set; }

        [Column("total_quantity")]
        public int total_quantity { get; set; }
    }
}
