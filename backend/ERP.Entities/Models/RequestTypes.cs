using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestTypes")]
    public class RequestTypes : AuditableEntity
    {
        [Column("code")]
        [StringLength(50)]
        public string code { get; set; }

        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }

        [Column("category")]
        [StringLength(50)]
        public string category { get; set; }

        [Column("workflow_id")]
        public int? workflow_id { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }
    }
}
