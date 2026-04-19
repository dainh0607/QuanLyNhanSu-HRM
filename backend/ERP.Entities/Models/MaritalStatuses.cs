using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("MaritalStatuses")]
    public class MaritalStatuses : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("code")]
        [StringLength(10)]
        public string code { get; set; }

        [Column("name")]
        [StringLength(50)]
        public string name { get; set; }
    }
}
