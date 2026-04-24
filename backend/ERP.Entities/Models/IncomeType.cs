using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("IncomeTypes")]
    public class IncomeType : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [Required]
        [StringLength(100)]
        public string name { get; set; }

        [Column("keyword")]
        [StringLength(100)]
        public string? keyword { get; set; }

        [Column("display_order")]
        public int display_order { get; set; } = 0;

        [Column("is_active")]
        public bool is_active { get; set; } = true;
    }
}
