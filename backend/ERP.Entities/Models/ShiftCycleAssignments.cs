using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("ShiftCycleAssignments")]
    public class ShiftCycleAssignments : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("template_id")]
        public int template_id { get; set; }

        [ForeignKey("template_id")]
        public virtual ShiftCycleTemplates Template { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime? end_date { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;

        [Column("note")]
        public string note { get; set; }
    }
}
