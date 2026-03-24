using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AttendanceLogs")]
    public class AttendanceLogs : BaseEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("timestamp")]
        public DateTime timestamp { get; set; }

        [Column("machine_id")]
        public int? machine_id { get; set; }

        [Column("type")]
        [StringLength(10)]
        public string type { get; set; }
    }
}
