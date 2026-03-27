using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestPurchases")]
    public class RequestPurchases
    {
        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("purchase_date")]
        public DateTime purchase_date { get; set; }

        [Column("payment_method")]
        [StringLength(20)]
        public string payment_method { get; set; }

        [Column("total_amount")]
        public decimal total_amount { get; set; }

        [Column("note")]
        public string note { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }

        public virtual ICollection<RequestPurchaseDetails> Details { get; set; } = new HashSet<RequestPurchaseDetails>();
    }
}
