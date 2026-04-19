using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("PublicHolidays")]
    public class PublicHolidays : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("holiday_name")]
        [Required]
        [StringLength(100)]
        public string holiday_name { get; set; }

        [Column("holiday_date")]
        public DateTime holiday_date { get; set; }

        [Column("is_paid")]
        public bool is_paid { get; set; } = true;

        [Column("description")]
        public string description { get; set; }
    }
}
