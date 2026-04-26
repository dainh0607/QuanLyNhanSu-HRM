using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    [Table("ShiftJobEmployees")]
    public class ShiftJobEmployees : ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("shift_job_id")]
        public int shift_job_id { get; set; }

        [ForeignKey("shift_job_id")]
        public virtual ShiftJobs ShiftJob { get; set; } = null!;

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; } = null!;
    }
}
