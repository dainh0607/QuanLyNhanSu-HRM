using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AttendanceRecords")]
    public class AttendanceRecords : AuditableEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("shift_assignment_id")]
        public int? shift_assignment_id { get; set; }

        [ForeignKey("shift_assignment_id")]
        public virtual ShiftAssignments ShiftAssignment { get; set; }

        [Column("record_time")]
        public DateTime record_time { get; set; }

        [Column("record_type")]
        [StringLength(10)]
        public string record_type { get; set; }

        [Column("device_id")]
        public int? device_id { get; set; }

        [ForeignKey("device_id")]
        public virtual Devices Device { get; set; }

        [Column("location_lat")]
        public decimal? location_lat { get; set; }

        [Column("location_lng")]
        public decimal? location_lng { get; set; }

        [Column("face_image")]
        [StringLength(500)]
        public string face_image { get; set; }

        [Column("verified")]
        public bool verified { get; set; }

        [Column("source")]
        [StringLength(20)]
        public string source { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
