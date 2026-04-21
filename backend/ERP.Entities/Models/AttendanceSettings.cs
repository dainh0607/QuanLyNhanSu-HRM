using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AttendanceSettings")]
    public class AttendanceSettings : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Key]
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; } = null!;

        [Column("policy_id")]
        public int? policy_id { get; set; }

        [ForeignKey("policy_id")]
        public virtual AttendancePolicies? Policy { get; set; }

        [Column("multi_device_login")]
        public bool multi_device_login { get; set; }

        [Column("track_location")]
        public bool track_location { get; set; }

        [Column("no_attendance")]
        public bool no_attendance { get; set; }

        [Column("unrestricted_attendance")]
        public bool unrestricted_attendance { get; set; }

        [Column("allow_late_in_out")]
        public bool allow_late_in_out { get; set; }

        [Column("allow_early_in_out")]
        public bool allow_early_in_out { get; set; }

        [Column("auto_attendance")]
        public bool auto_attendance { get; set; }

        [Column("auto_checkout")]
        public bool auto_checkout { get; set; }

        [Column("require_face_in")]
        public bool require_face_in { get; set; }

        [Column("require_face_out")]
        public bool require_face_out { get; set; }

        [Column("proxy_attendance")]
        public bool proxy_attendance { get; set; }
    }
}
