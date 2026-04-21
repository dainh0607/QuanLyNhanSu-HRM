using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AttendanceLocations")]
    public class AttendanceLocations : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("branch_id")]
        public int branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches Branch { get; set; } = null!;

        [Column("location_name")]
        [Required]
        [StringLength(100)]
        public string location_name { get; set; } = null!;

        [Column("latitude", TypeName = "decimal(18,10)")]
        public decimal latitude { get; set; }

        [Column("longitude", TypeName = "decimal(18,10)")]
        public decimal longitude { get; set; }

        [Column("radius_meters")]
        public int radius_meters { get; set; } // Allowed radius in meters

        [Column("is_active")]
        public bool is_active { get; set; } = true;
    }
}
