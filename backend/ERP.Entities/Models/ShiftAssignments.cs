using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("ShiftAssignments")]
    public class ShiftAssignments : AuditableEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("shift_id")]
        public int shift_id { get; set; }

        [ForeignKey("shift_id")]
        public virtual Shifts Shift { get; set; }

        [Column("assignment_date")]
        public DateTime assignment_date { get; set; }

        [Column("is_published")]
        public bool is_published { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string status { get; set; } = "draft";

        [Column("created_by")]
        public int created_by { get; set; }

        [Column("modified_at")]
        public DateTime? modified_at { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
