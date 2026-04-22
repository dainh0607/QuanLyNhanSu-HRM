using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("OpenShifts")]
    public class OpenShifts : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("shift_id")]
        public int shift_id { get; set; }

        [ForeignKey("shift_id")]
        public virtual Shifts Shift { get; set; }

        [Column("branch_id")]
        public int branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches Branch { get; set; }

        [Column("department_id")]
        public int department_id { get; set; }

        [ForeignKey("department_id")]
        public virtual Departments Department { get; set; }

        [Column("job_title_id")]
        public int job_title_id { get; set; }

        [ForeignKey("job_title_id")]
        public virtual JobTitles JobTitle { get; set; }

        [Column("required_quantity")]
        public int required_quantity { get; set; }

        [Column("auto_publish")]
        public bool auto_publish { get; set; }

        [Column("status")]
        [StringLength(20)]
        public string status { get; set; }

        [Column("open_date")]
        public DateTime open_date { get; set; }

        [Column("close_date")]
        public DateTime? close_date { get; set; }

        [Column("note")]
        public string? note { get; set; }
    }
}
