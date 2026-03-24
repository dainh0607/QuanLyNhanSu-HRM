using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Permissions")]
    public class Permissions : BaseEntity
    {
        [Column("resource")]
        [StringLength(100)]
        public string resource { get; set; }

        [Column("action")]
        [StringLength(50)]
        public string action { get; set; }

        [Column("description")]
        [StringLength(255)]
        public string description { get; set; }
    }
}
