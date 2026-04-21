using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AttendanceModifications")]
    public class AttendanceModifications : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("attendance_record_id")]
        public int attendance_record_id { get; set; }

        [ForeignKey("attendance_record_id")]
        public virtual AttendanceRecords AttendanceRecord { get; set; } = null!;

        [Column("modified_by")]
        public int modified_by { get; set; }

        [Column("modified_at")]
        public DateTime modified_at { get; set; }

        [Column("old_time")]
        public DateTime old_time { get; set; }

        [Column("new_time")]
        public DateTime new_time { get; set; }

        [Column("reason")]
        public string reason { get; set; } = null!;
    }
}
