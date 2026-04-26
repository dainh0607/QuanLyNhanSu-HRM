using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    [Table("ShiftJobDepartments")]
    public class ShiftJobDepartments : ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("shift_job_id")]
        public int shift_job_id { get; set; }

        [ForeignKey("shift_job_id")]
        public virtual ShiftJobs ShiftJob { get; set; } = null!;

        [Column("department_id")]
        public int department_id { get; set; }

        [ForeignKey("department_id")]
        public virtual Departments Department { get; set; } = null!;
    }
}
