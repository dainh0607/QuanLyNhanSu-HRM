using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestPurchaseDetails")]
    public class RequestPurchaseDetails : BaseEntity
    {
        [Column("purchase_id")]
        public int purchase_id { get; set; }

        [Column("item_name")]
        [StringLength(200)]
        public string item_name { get; set; }

        [Column("quantity")]
        public decimal quantity { get; set; }

        [Column("unit_price")]
        public decimal unit_price { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        [Column("total_amount")]
        public decimal? total_amount { get; set; }
    }
}
