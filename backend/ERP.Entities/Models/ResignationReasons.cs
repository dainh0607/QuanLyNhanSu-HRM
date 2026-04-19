using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("ResignationReasons")]
    public class ResignationReasons : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Required]
        [Column("reason_name")]
        [StringLength(255)]
        public string reason_name { get; set; }

        [Column("is_default")]
        public bool is_default { get; set; }
    }
}
