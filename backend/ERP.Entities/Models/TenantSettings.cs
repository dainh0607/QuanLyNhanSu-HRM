using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    [Table("TenantSettings")]
    public class TenantSettings : ITenantEntity
    {
        [Column("id")]
        public int id { get; set; }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [ForeignKey("tenant_id")]
        public virtual Tenants Tenant { get; set; }

        [Column("auto_schedule_next_week")]
        public bool auto_schedule_next_week { get; set; } = true;

        [Column("allow_shift_registration")]
        public bool allow_shift_registration { get; set; } = true;

        [Column("enable_registration_lock")]
        public bool enable_registration_lock { get; set; } = false;

        [Column("registration_lock_day")]
        [StringLength(20)]
        public string registration_lock_day { get; set; } = "Friday";

        [Column("advance_schedule_weeks")]
        public int advance_schedule_weeks { get; set; } = 1;

        [Column("require_shift_publish")]
        public bool require_shift_publish { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
