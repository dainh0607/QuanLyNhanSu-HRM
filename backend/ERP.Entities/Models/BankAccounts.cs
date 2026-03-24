using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("BankAccounts")]
    public class BankAccounts : BaseEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("account_holder")]
        [StringLength(100)]
        public string account_holder { get; set; }

        [Column("account_number")]
        [StringLength(50)]
        public string account_number { get; set; }

        [Column("bank_name")]
        [StringLength(100)]
        public string bank_name { get; set; }

        [Column("branch")]
        [StringLength(100)]
        public string branch { get; set; }
    }
}
