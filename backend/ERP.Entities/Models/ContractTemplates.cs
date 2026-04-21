using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("ContractTemplates")]
    public class ContractTemplates : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Required]
        [StringLength(200)]
        public string name { get; set; } = null!;

        [Required]
        public string content { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string category { get; set; } = null!;

        public bool is_active { get; set; } = true;

        public virtual ICollection<Contracts> Contracts { get; set; } = new List<Contracts>();
    }
}
