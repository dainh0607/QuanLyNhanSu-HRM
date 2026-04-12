using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AttendancePolicies")]
    public class AttendancePolicies : AuditableEntity
    {
        [Column("policy_name")]
        [Required]
        [StringLength(100)]
        public string policy_name { get; set; }

        [Column("description")]
        public string description { get; set; }

        [Column("allow_late_minutes")]
        public int allow_late_minutes { get; set; }

        [Column("allow_early_minutes")]
        public int allow_early_minutes { get; set; }

        [Column("require_face_recognition")]
        public bool require_face_recognition { get; set; }

        [Column("require_location_check")]
        public bool require_location_check { get; set; }

        [Column("allow_wifi_attendance")]
        public bool allow_wifi_attendance { get; set; }

        [Column("wifi_name")]
        [StringLength(100)]
        public string wifi_name { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;

        [Column("round_checkin_minutes")]
        public int round_checkin_minutes { get; set; }

        [Column("round_checkout_minutes")]
        public int round_checkout_minutes { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
