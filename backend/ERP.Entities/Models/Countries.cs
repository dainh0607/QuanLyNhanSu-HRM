using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Countries")]
    public class Countries : AuditableEntity
    {
        [Required]
        [StringLength(10)]
        [Column("code")]
        public string code { get; set; }

        [Required]
        [StringLength(100)]
        [Column("name")]
        public string name { get; set; }

        public virtual ICollection<Provinces> Provinces { get; set; } = new HashSet<Provinces>();
    }
}
