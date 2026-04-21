using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Devices")]
    public class Devices : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; } = null!;

        [Column("imei")]
        [StringLength(50)]
        public string imei { get; set; } = null!;

        [Column("device_name")]
        [StringLength(100)]
        public string device_name { get; set; } = null!;

        [Column("version")]
        [StringLength(50)]
        public string? version { get; set; }

        [Column("os")]
        [StringLength(50)]
        public string? os { get; set; }

        [Column("device_type")]
        [StringLength(50)]
        public string? device_type { get; set; }
    }
}
