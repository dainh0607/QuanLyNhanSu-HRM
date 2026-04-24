using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("MergedProvinces")]
    public class MergedProvinces : AuditableEntity
    {
        [Required]
        [StringLength(20)]
        [Column("code")]
        public string code { get; set; } = null!;

        [Required]
        [StringLength(100)]
        [Column("name")]
        public string name { get; set; } = null!;

        [Column("country_code")]
        [StringLength(10)]
        public string country_code { get; set; } = "VN";

        public virtual ICollection<MergedWards> Wards { get; set; } = new HashSet<MergedWards>();
    }
}
