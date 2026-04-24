using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    [Table("Majors")]
    public class Majors : AuditableEntity, ITenantEntity
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

        [Column("is_active")]
        public bool is_active { get; set; } = true;
    }
}
