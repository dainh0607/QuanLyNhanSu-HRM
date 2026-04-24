using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("MealTypes")]
    public class MealTypes : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [StringLength(100)]
        [Required]
        public string name { get; set; } = null!;

        [Column("keyword")]
        [StringLength(100)]
        [Required]
        public string keyword { get; set; } = null!;

        [Column("description")]
        [StringLength(500)]
        public string? description { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;

        [Column("display_order")]
        public int? display_order { get; set; }
    }
}
