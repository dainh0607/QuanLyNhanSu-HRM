using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Contracts")]
    public class Contracts : AuditableEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("contract_number")]
        [StringLength(50)]
        public string contract_number { get; set; }

        [Column("contract_type_id")]
        public int? contract_type_id { get; set; }

        [ForeignKey("contract_type_id")]
        public virtual ContractTypes? ContractType { get; set; }

        [Column("sign_date")]
        public DateTime? sign_date { get; set; }

        [Column("effective_date")]
        public DateTime? effective_date { get; set; }

        [Column("expiry_date")]
        public DateTime? expiry_date { get; set; }

        [Column("signed_by")]
        [StringLength(100)]
        public string signed_by { get; set; }

        [Column("tax_type")]
        [StringLength(50)]
        public string tax_type { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string status { get; set; }
    }
}
