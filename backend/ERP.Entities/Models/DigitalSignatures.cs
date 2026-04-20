using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("DigitalSignatures")]
    public class DigitalSignatures : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("signature_name")]
        [StringLength(100)]
        public string signature_name { get; set; }

        [Column("signature_data")]
        public string signature_data { get; set; }

        [Column("is_default")]
        public bool is_default { get; set; }

        [Column("certification_info")]
        public string? certification_info { get; set; }

        [Column("display_type")]
        [StringLength(20)]
        public string? display_type { get; set; }
    }
}
