using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("ContractSigners")]
    public class ContractSigners : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("contract_id")]
        public int contract_id { get; set; }

        [ForeignKey("contract_id")]
        public virtual Contracts Contract { get; set; } = null!;

        [Required]
        [StringLength(200)]
        public string email { get; set; } = null!;

        [Required]
        [StringLength(200)]
        public string full_name { get; set; } = null!;

        public int sign_order { get; set; }

        [Required]
        [StringLength(50)]
        public string status { get; set; } = null!;

        public DateTime? signed_at { get; set; }

        [StringLength(500)]
        public string? signature_token { get; set; }

        [StringLength(500)]
        public string? note { get; set; }

        [StringLength(10)]
        public string? otp_code { get; set; }

        public DateTime? otp_expiry { get; set; }

        public virtual ICollection<ContractSignerPositions> Positions { get; set; } = new List<ContractSignerPositions>();
    }
}
