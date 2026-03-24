using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestDisciplines")]
    public class RequestDisciplines
    {
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("title")]
        [StringLength(200)]
        public string title { get; set; }

        [Column("discipline_type_id")]
        public int? discipline_type_id { get; set; }

        [ForeignKey("discipline_type_id")]
        public virtual DisciplineTypes DisciplineType { get; set; }

        [Column("amount")]
        public decimal? amount { get; set; }

        [Column("decision_date")]
        public DateTime decision_date { get; set; }

        [Column("reason")]
        public string reason { get; set; }
    }
}
