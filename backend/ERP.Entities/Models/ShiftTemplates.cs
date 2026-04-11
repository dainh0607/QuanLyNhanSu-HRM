using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("ShiftTemplates")]
    public class ShiftTemplates : AuditableEntity
    {
        [Column("template_name")]
        [Required]
        [StringLength(100)]
        public string template_name { get; set; }

        [Column("start_time")]
        public TimeSpan start_time { get; set; }

        [Column("end_time")]
        public TimeSpan end_time { get; set; }

        [Column("is_cross_night")]
        public bool is_cross_night { get; set; }

        [Column("branch_ids")]
        public string? branch_ids { get; set; } // Comma-separated or JSON

        [Column("department_ids")]
        public string? department_ids { get; set; }

        [Column("position_ids")]
        public string? position_ids { get; set; }

        [Column("repeat_days")]
        public string? repeat_days { get; set; } // JSON array of days

        [Column("is_active")]
        public bool is_active { get; set; } = true;

        [Column("note")]
        public string? note { get; set; }
    }
}
