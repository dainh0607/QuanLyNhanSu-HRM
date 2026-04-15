using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("DailyAttendance")]
    public class DailyAttendance : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("date")]
        public DateTime date { get; set; }

        [Column("shift_id")]
        public int? shift_id { get; set; }

        [ForeignKey("shift_id")]
        public virtual Shifts Shift { get; set; }

        [Column("check_in_actual")]
        public DateTime? check_in_actual { get; set; }

        [Column("check_out_actual")]
        public DateTime? check_out_actual { get; set; }

        [Column("total_work_hours")]
        public decimal total_work_hours { get; set; }

        [Column("late_minutes")]
        public int late_minutes { get; set; }

        [Column("early_minutes")]
        public int early_minutes { get; set; }

        [Column("overtime_hours")]
        public decimal overtime_hours { get; set; }

        [Column("is_absent")]
        public bool is_absent { get; set; }

        [Column("leave_type_id")]
        public int? leave_type_id { get; set; }

        [ForeignKey("leave_type_id")]
        public virtual LeaveTypes LeaveType { get; set; }

        [Column("status")]
        [StringLength(20)]
        public string status { get; set; } // Valid, Late, Early, Absent, Leave

        [Column("note")]
        public string note { get; set; }
    }
}
