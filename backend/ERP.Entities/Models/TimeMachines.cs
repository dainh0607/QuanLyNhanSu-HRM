using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("TimeMachines")]
    public class TimeMachines : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("machine_name")]
        [StringLength(100)]
        public string machine_name { get; set; }

        [Column("machine_code")]
        [StringLength(50)]
        public string machine_code { get; set; }

        public virtual ICollection<AttendanceLogs> AttendanceLogs { get; set; } = new HashSet<AttendanceLogs>();
    }
}
