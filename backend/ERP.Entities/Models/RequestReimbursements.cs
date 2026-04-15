using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestReimbursements")]
    public class RequestReimbursements : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("title")]
        [StringLength(200)]
        public string title { get; set; }

        [Column("request_date")]
        public DateTime request_date { get; set; }

        [Column("group_name")]
        [StringLength(100)]
        public string group_name { get; set; }

        [Column("request_type_id")]
        public int? request_type_id { get; set; }

        [ForeignKey("request_type_id")]
        public virtual RequestTypes RequestType { get; set; }

        [Column("payment_purpose")]
        public string payment_purpose { get; set; }

        [Column("payment_method")]
        [StringLength(20)]
        public string payment_method { get; set; }

        [Column("reimbursement_deadline")]
        public DateTime? reimbursement_deadline { get; set; }

        [Column("total_amount")]
        public decimal total_amount { get; set; }

        [Column("note")]
        public string note { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }
    }
}
