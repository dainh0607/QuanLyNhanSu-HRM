using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Salaries")]
    public class Salaries : BaseEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("payment_method")]
        [StringLength(50)]
        public string payment_method { get; set; }

        [Column("salary_grade")]
        [StringLength(50)]
        public string salary_grade { get; set; }

        [Column("base_salary")]
        public decimal? base_salary { get; set; }
    }
}
