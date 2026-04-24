using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    [Table("EmploymentTypes")]
    public class EmploymentTypes : AuditableEntity, ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [StringLength(100)]
        [Required]
        public string name { get; set; } = null!;

        [Column("description")]
        [StringLength(500)]
        public string? description { get; set; }

        [Column("display_order")]
        public int? display_order { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;
    }
}
