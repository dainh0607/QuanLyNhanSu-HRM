using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestSalaryAdvances")]
    public class RequestSalaryAdvances
    {
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("title")]
        [StringLength(200)]
        public string title { get; set; }

        [Column("advance_type_id")]
        public int? advance_type_id { get; set; }

        [ForeignKey("advance_type_id")]
        public virtual AdvanceTypes AdvanceType { get; set; }

        [Column("amount")]
        public decimal amount { get; set; }

        [Column("decision_date")]
        public DateTime decision_date { get; set; }

        [Column("reason")]
        public string reason { get; set; }
    }
}
