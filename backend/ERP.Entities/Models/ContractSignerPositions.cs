using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("ContractSignerPositions")]
    public class ContractSignerPositions : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("signer_id")]
        public int signer_id { get; set; }

        [ForeignKey("signer_id")]
        public virtual ContractSigners Signer { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string type { get; set; } = null!; // signature, fullname, date

        public int page_number { get; set; }

        public float x_pos { get; set; }
        public float y_pos { get; set; }
        
        public float? width { get; set; }
        public float? height { get; set; }
    }
}
