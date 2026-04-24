using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("TenantCustomFields")]
    public class TenantCustomFields : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("field_name")]
        [Required]
        [StringLength(100)]
        public string field_name { get; set; } = null!;

        [Column("field_key")]
        [Required]
        [StringLength(100)]
        public string field_key { get; set; } = null!;

        [Column("field_type")]
        [Required]
        [StringLength(50)]
        public string field_type { get; set; } = null!; // Text, TextArea, Number, Date, Select

        [Column("options_json")]
        public string? options_json { get; set; } // JSON array for Select type

        [Column("is_active")]
        public bool is_active { get; set; } = true;

        [Column("display_order")]
        public int? display_order { get; set; }
    }
}
