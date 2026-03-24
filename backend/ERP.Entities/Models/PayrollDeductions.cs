using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("PayrollDeductions")]
    public class PayrollDeductions : BaseEntity
    {
        [Column("payroll_id")]
        public int payroll_id { get; set; }

        [ForeignKey("payroll_id")]
        public virtual Payrolls Payroll { get; set; }

        [Column("deduction_id")]
        public int deduction_id { get; set; }

        [ForeignKey("deduction_id")]
        public virtual Deductions Deduction { get; set; }

        [Column("amount")]
        public decimal amount { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
