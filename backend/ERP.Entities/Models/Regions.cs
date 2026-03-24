using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Regions")]
    public class Regions : BaseEntity
    {
        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }

        [Column("code")]
        [StringLength(50)]
        public string code { get; set; }
    }
}
