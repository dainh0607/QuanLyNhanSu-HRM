using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Deductions")]
    public class Deductions : AuditableEntity
    {
        [Column("code")]
        [StringLength(50)]
        public string code { get; set; }

        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }

        [Column("type")]
        [StringLength(20)]
        public string type { get; set; }

        [Column("amount")]
        public decimal? amount { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }
    }
}
