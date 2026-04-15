using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestPayments")]
    public class RequestPayments : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("payment_method")]
        [StringLength(20)]
        public string payment_method { get; set; }

        [Column("total_amount")]
        public decimal total_amount { get; set; }

        [Column("payment_date")]
        public DateTime payment_date { get; set; }

        [Column("payment_purpose")]
        public string payment_purpose { get; set; }

        [Column("account_holder")]
        [StringLength(100)]
        public string account_holder { get; set; }

        [Column("bank_name")]
        [StringLength(100)]
        public string bank_name { get; set; }

        [Column("account_number")]
        [StringLength(50)]
        public string account_number { get; set; }

        [Column("reason")]
        public string reason { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }
    }
}
