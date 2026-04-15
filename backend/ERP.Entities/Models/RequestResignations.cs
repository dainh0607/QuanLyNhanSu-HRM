using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestResignations")]
    public class RequestResignations : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("resignation_date")]
        public DateTime resignation_date { get; set; }

        [Column("handover_employee_id")]
        public int? handover_employee_id { get; set; }

        [Column("reason")]
        public string reason { get; set; }
    }
}
