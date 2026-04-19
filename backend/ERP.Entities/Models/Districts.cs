using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Districts")]
    public class Districts : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Required]
        [StringLength(20)]
        [Column("code")]
        public string code { get; set; }

        [Required]
        [StringLength(100)]
        [Column("name")]
        public string name { get; set; }

        [Column("province_code")]
        [StringLength(20)]
        public string province_code { get; set; }

        // FIX: Foreign key relationship to Provinces.code (not Provinces.Id)
        [ForeignKey(nameof(province_code))]
        public virtual Provinces Province { get; set; }
    }
}
