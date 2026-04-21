using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("BankAccounts")]
    public class BankAccounts : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; } = null!;

        [Column("account_holder")]
        [StringLength(100)]
        public string account_holder { get; set; } = null!;

        [Column("account_number")]
        [StringLength(50)]
        public string account_number { get; set; } = null!;

        [Column("bank_name")]
        [StringLength(100)]
        public string bank_name { get; set; } = null!;

        [Column("branch")]
        [StringLength(100)]
        public string? branch { get; set; }
    }
}
