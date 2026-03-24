using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("PayrollDetails")]
    public class PayrollDetails : BaseEntity
    {
        [Column("payroll_id")]
        public int payroll_id { get; set; }

        [ForeignKey("payroll_id")]
        public virtual Payrolls Payroll { get; set; }

        [Column("component_type")]
        [StringLength(20)]
        public string component_type { get; set; }

        [Column("component_name")]
        [StringLength(100)]
        public string component_name { get; set; }

        [Column("amount")]
        public decimal amount { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
