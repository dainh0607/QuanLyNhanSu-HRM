using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("MergedWards")]
    public class MergedWards : AuditableEntity
    {
        [Required]
        [StringLength(20)]
        [Column("code")]
        public string code { get; set; } = null!;

        [Required]
        [StringLength(100)]
        [Column("name")]
        public string name { get; set; } = null!;

        [Column("province_code")]
        [StringLength(20)]
        public string province_code { get; set; } = null!;

        [ForeignKey(nameof(province_code))]
        public virtual MergedProvinces Province { get; set; } = null!;
    }
}
