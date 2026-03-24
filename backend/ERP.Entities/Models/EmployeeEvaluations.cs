using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmployeeEvaluations")]
    public class EmployeeEvaluations
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("evaluation_id")]
        public int evaluation_id { get; set; }

        [ForeignKey("evaluation_id")]
        public virtual Evaluations Evaluation { get; set; }

        [Column("evaluation_date")]
        public DateTime? evaluation_date { get; set; }

        [Column("result")]
        public string result { get; set; }
    }
}
