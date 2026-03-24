using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestReimbursementDetails")]
    public class RequestReimbursementDetails : BaseEntity
    {
        [Column("reimbursement_id")]
        public int reimbursement_id { get; set; }

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
