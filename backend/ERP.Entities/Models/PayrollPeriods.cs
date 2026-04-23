using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("PayrollPeriods")]
    public class PayrollPeriods : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("status")]
        [StringLength(20)]
        public string status { get; set; }

        [Column("applicable_departments")]
        public string applicable_departments { get; set; }

        [Column("applicable_job_titles")]
        public string applicable_job_titles { get; set; }

        public virtual ICollection<Payrolls> Payrolls { get; set; } = new HashSet<Payrolls>();
    }
}
