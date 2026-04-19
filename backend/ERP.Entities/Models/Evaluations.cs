using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Evaluations")]
    public class Evaluations : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("evaluation_name")]
        [StringLength(200)]
        public string evaluation_name { get; set; }

        [Column("description")]
        public string description { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }
    }
}
