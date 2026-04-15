using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Requests")]
    public class Requests : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("request_type_id")]
        public int request_type_id { get; set; }

        [ForeignKey("request_type_id")]
        public virtual RequestTypes RequestType { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("status")]
        [StringLength(20)]
        public string status { get; set; }

        [Column("created_by")]
        public int created_by { get; set; }

        [Column("approved_by")]
        public int? approved_by { get; set; }

        [ForeignKey("approved_by")]
        public virtual Employees ApprovedBy { get; set; }

        [Column("approved_at")]
        public DateTime? approved_at { get; set; }

        [Column("rejection_reason")]
        public string rejection_reason { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
