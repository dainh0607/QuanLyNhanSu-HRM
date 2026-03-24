using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestPurchaseRequestDetails")]
    public class RequestPurchaseRequestDetails : BaseEntity
    {
        [Column("purchase_request_id")]
        public int purchase_request_id { get; set; }

        [Column("content")]
        public string content { get; set; }

        [Column("quantity")]
        public decimal quantity { get; set; }

        [Column("unit_price")]
        public decimal unit_price { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        [Column("total_amount")]
        public decimal? total_amount { get; set; }
    }
}
