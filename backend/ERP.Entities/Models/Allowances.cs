using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Allowances")]
    public class Allowances : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("salary_id")]
        public int salary_id { get; set; }

        [ForeignKey("salary_id")]
        public virtual Salaries Salary { get; set; } = null!;

        [Column("allowance_type_id")]
        public int allowance_type_id { get; set; }

        [ForeignKey("allowance_type_id")]
        public virtual AllowanceType AllowanceType { get; set; }

        [Column("amount")]
        public decimal amount { get; set; }
    }
}
