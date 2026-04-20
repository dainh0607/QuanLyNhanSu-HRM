using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("WorkHistories")]
    public class WorkHistory : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("company_name")]
        [StringLength(200)]
        public string company_name { get; set; }

        [Column("job_title")]
        [StringLength(100)]
        public string job_title { get; set; }

        [Column("work_duration")]
        [StringLength(50)]
        public string work_duration { get; set; }

        [Column("start_date")]
        public DateTime? start_date { get; set; }

        [Column("end_date")]
        public DateTime? end_date { get; set; }

        [Column("is_current")]
        public bool is_current { get; set; }
    }
}
