using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestPurchaseRequests")]
    public class RequestPurchaseRequests
    {
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("request_date")]
        public DateTime request_date { get; set; }

        [Column("request_type_id")]
        public int? request_type_id { get; set; }

        [ForeignKey("request_type_id")]
        public virtual RequestTypes RequestType { get; set; }

        [Column("payment_type")]
        [StringLength(50)]
        public string payment_type { get; set; }

        [Column("payment_method")]
        [StringLength(20)]
        public string payment_method { get; set; }

        [Column("purpose")]
        public string purpose { get; set; }

        [Column("total_amount")]
        public decimal total_amount { get; set; }

        [Column("note")]
        public string note { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }
    }
}
