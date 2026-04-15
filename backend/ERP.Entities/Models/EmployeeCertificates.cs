using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmployeeCertificates")]
    public class EmployeeCertificates : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("certificate_id")]
        public int certificate_id { get; set; }

        [ForeignKey("certificate_id")]
        public virtual Certificates Certificate { get; set; }

        [Column("issue_date")]
        public DateTime? issue_date { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }
    }
}
