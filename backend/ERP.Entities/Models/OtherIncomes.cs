using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("OtherIncomes")]
    public class OtherIncomes : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("salary_id")]
        public int salary_id { get; set; }

        [ForeignKey("salary_id")]
        public virtual Salaries Salary { get; set; }

        [Column("income_type_id")]
        public int income_type_id { get; set; }

        [ForeignKey("income_type_id")]
        public virtual IncomeType IncomeType { get; set; }

        [Column("amount")]
        public decimal amount { get; set; }
    }
}
