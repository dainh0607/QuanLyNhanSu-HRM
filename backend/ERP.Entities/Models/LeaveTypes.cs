using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("LeaveTypes")]
    public class LeaveTypes : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [StringLength(50)]
        public string name { get; set; }

        [Column("is_paid")]
        public bool is_paid { get; set; }
    }
}
