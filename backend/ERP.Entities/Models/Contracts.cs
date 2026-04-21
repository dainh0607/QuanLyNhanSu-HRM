using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Contracts")]
    public class Contracts : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; } = null!;

        [Column("contract_number")]
        [StringLength(50)]
        public string contract_number { get; set; } = null!;

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
        public string? signed_by { get; set; }

        [Column("tax_type")]
        [StringLength(50)]
        public string? tax_type { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string? attachment { get; set; }

        [Column("is_electronic")]
        public bool is_electronic { get; set; } = false;

        [Column("note")]
        public string? note { get; set; }

        [Column("template_id")]
        public int? template_id { get; set; }

        [ForeignKey("template_id")]
        public virtual ContractTemplates? Template { get; set; }

        public virtual ICollection<ContractSigners> Signers { get; set; } = new List<ContractSigners>();

        [Column("status")]
        [StringLength(50)]
        public string status { get; set; } = null!;
    }
}
