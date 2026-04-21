using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("VariableSalaries")]
    public class VariableSalary : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("salary_id")]
        public int salary_id { get; set; }

        [ForeignKey("salary_id")]
        public virtual Salaries Salary { get; set; }

        [Column("payment_method")]
        [StringLength(50)]
        public string payment_method { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("salary_grade_id")]
        public int salary_grade_id { get; set; }

        [ForeignKey("salary_grade_id")]
        public virtual SalaryGrade SalaryGrade { get; set; }
        
        [Column("note")]
        [StringLength(500)]
        public string? note { get; set; }
    }
}
