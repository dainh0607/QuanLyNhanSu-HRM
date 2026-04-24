using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("SystemFields")]
    public class SystemFields : BaseEntity
    {
        [Column("category")]
        [Required]
        [StringLength(100)]
        public string category { get; set; } = null!;

        [Column("field_name")]
        [Required]
        [StringLength(100)]
        public string field_name { get; set; } = null!;

        [Column("field_type")]
        [Required]
        [StringLength(50)]
        public string field_type { get; set; } = null!;

        [Column("display_order")]
        public int display_order { get; set; }
    }
}
