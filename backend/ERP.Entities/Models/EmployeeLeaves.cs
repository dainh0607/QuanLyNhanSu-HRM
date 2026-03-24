using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmployeeLeaves")]
    public class EmployeeLeaves : BaseEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("leave_type_id")]
        public int leave_type_id { get; set; }

        [ForeignKey("leave_type_id")]
        public virtual LeaveTypes LeaveType { get; set; }

        [Column("total_days")]
        public decimal total_days { get; set; }

        [Column("used_days")]
        public decimal used_days { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        [Column("remaining_days")]
        public decimal? remaining_days { get; set; }

        [Column("year")]
        public int year { get; set; }
    }
}
