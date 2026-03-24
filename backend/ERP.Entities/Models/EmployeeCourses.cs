using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmployeeCourses")]
    public class EmployeeCourses
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("course_id")]
        public int course_id { get; set; }

        [ForeignKey("course_id")]
        public virtual Courses Course { get; set; }

        [Column("completion_date")]
        public DateTime? completion_date { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }
    }
}
