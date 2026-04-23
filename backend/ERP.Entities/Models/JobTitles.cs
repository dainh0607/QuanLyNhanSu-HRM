using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("JobTitles")]
    public class JobTitles : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [StringLength(200)]
        public string name { get; set; } = null!;

        [Column("code")]
        [StringLength(50)]
        public string code { get; set; } = null!;

        [Column("note")]
        [StringLength(500)]
        public string? note { get; set; }

        public virtual ICollection<Employees> Employees { get; set; } = new HashSet<Employees>();
    }
}
