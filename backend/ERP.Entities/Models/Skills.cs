using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Skills")]
    public class Skills : BaseEntity
    {
        [Column("skill_name")]
        [StringLength(100)]
        public string skill_name { get; set; }

        [Column("description")]
        public string description { get; set; }
    }
}
