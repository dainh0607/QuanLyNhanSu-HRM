using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Roles")]
    public class Roles : BaseEntity
    {
        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }

        [Column("description")]
        [StringLength(255)]
        public string description { get; set; }
    }
}
