using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("ShiftCycleItems")]
    public class ShiftCycleItems : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("template_id")]
        public int template_id { get; set; }

        [ForeignKey("template_id")]
        public virtual ShiftCycleTemplates Template { get; set; }

        [Column("day_number")]
        public int day_number { get; set; } // Day 1, Day 2, etc. in the cycle

        [Column("shift_id")]
        public int? shift_id { get; set; } // Null if it's an off-day

        [ForeignKey("shift_id")]
        public virtual Shifts Shift { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
