using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("ShiftCycleTemplates")]
    public class ShiftCycleTemplates : AuditableEntity
    {
        [Column("template_name")]
        [Required]
        [StringLength(100)]
        public string template_name { get; set; }

        [Column("cycle_days")]
        public int cycle_days { get; set; } // e.g., 7 for weekly, 14 for bi-weekly

        [Column("description")]
        public string description { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;
    }
}
