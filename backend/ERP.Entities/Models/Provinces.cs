using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Provinces")]
    public class Provinces : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
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

        [Column("country_code")]
        [StringLength(10)]
        public string country_code { get; set; }

        // FIX: Foreign key relationship to Countries.code (not Countries.Id)
        [ForeignKey(nameof(country_code))]
        public virtual Countries Country { get; set; }

        // Districts collection
        public virtual ICollection<Districts> Districts { get; set; } = new HashSet<Districts>();
    }
}
