using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestApprovals")]
    public class RequestApprovals : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("approver_id")]
        public int approver_id { get; set; }

        [Column("step_order")]
        public int step_order { get; set; }

        [Column("status")]
        [StringLength(20)]
        public string status { get; set; }

        [Column("approved_at")]
        public DateTime? approved_at { get; set; }

        [Column("comment")]
        public string comment { get; set; }
    }
}
