using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestBorrows")]
    public class RequestBorrows : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("note")]
        public string note { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }

        public virtual ICollection<RequestBorrowDetails> Details { get; set; } = new HashSet<RequestBorrowDetails>();
    }
}
