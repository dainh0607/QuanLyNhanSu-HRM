using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("MonthlyAttendanceSummary")]
    public class MonthlyAttendanceSummary : AuditableEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("year_month")]
        public int year_month { get; set; }

        [Column("total_work_days")]
        public int total_work_days { get; set; }

        [Column("total_work_hours")]
        public decimal total_work_hours { get; set; }

        [Column("total_overtime_hours")]
        public decimal total_overtime_hours { get; set; }

        [Column("total_late_minutes")]
        public int total_late_minutes { get; set; }

        [Column("total_early_minutes")]
        public int total_early_minutes { get; set; }

        [Column("total_absent_days")]
        public int total_absent_days { get; set; }

        [Column("total_paid_leave_days")]
        public decimal total_paid_leave_days { get; set; }

        [Column("total_unpaid_leave_days")]
        public decimal total_unpaid_leave_days { get; set; }
    }
}
