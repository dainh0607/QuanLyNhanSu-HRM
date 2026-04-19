using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Countries")]
    public class Countries : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Required]
        [StringLength(10)]
        [Column("code")]
        public string code { get; set; }

        [Required]
        [StringLength(100)]
        [Column("name")]
        public string name { get; set; }

        public virtual ICollection<Provinces> Provinces { get; set; } = new HashSet<Provinces>();
    }
}
