using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Salaries")]
    public class Salaries : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("payment_method")]
        [StringLength(50)]
        public string payment_method { get; set; }

        [Column("salary_grade_id")]
        public int? salary_grade_id { get; set; }

        [ForeignKey("salary_grade_id")]
        public virtual SalaryGrade SalaryGrade { get; set; }

        [Column("base_salary")]
        public decimal? base_salary { get; set; }

        public virtual ICollection<Allowances> Allowances { get; set; } = new HashSet<Allowances>();
        public virtual ICollection<OtherIncomes> OtherIncomes { get; set; } = new HashSet<OtherIncomes>();
        public virtual ICollection<VariableSalary> VariableSalaries { get; set; } = new HashSet<VariableSalary>();
    }
}
