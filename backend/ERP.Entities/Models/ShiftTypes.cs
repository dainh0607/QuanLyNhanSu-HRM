using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("ShiftTypes")]
    public class ShiftTypes : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [StringLength(50)]
        public string name { get; set; }

        [Column("description")]
        [StringLength(255)]
        public string description { get; set; }
    }
}
