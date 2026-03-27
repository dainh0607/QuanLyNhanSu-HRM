using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Allowances")]
    public class Allowances : BaseEntity
    {
        [Column("salary_id")]
        public int salary_id { get; set; }

        [ForeignKey("salary_id")]
        public virtual Salaries Salary { get; set; }

        [Column("allowance_name")]
        [StringLength(100)]
        public string allowance_name { get; set; }

        [Column("amount")]
        public decimal amount { get; set; }
    }
}
