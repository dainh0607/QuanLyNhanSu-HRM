using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmployeeEvaluations")]
    public class EmployeeEvaluations : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

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
