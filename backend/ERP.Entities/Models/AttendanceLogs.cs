using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AttendanceLogs")]
    public class AttendanceLogs : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; } = null!;

        [Column("timestamp")]
        public DateTime timestamp { get; set; }

        [Column("machine_id")]
        public int? machine_id { get; set; }

        [ForeignKey("machine_id")]
        public virtual TimeMachines? Machine { get; set; }

        [Column("type")]
        [StringLength(10)]
        public string type { get; set; } = null!;
    }
}
