using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Payrolls")]
    public class Payrolls : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("period_id")]
        public int period_id { get; set; }

        [ForeignKey("period_id")]
        public virtual PayrollPeriods Period { get; set; }

        [Column("base_salary")]
        public decimal base_salary { get; set; }

        [Column("total_allowances")]
        public decimal total_allowances { get; set; }

        [Column("total_deductions")]
        public decimal total_deductions { get; set; }

        [Column("net_salary")]
        public decimal net_salary { get; set; }

        [Column("status")]
        [StringLength(20)]
        public string status { get; set; }

        [Column("approved_by")]
        public int? approved_by { get; set; }

        [Column("approved_at")]
        public DateTime? approved_at { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
