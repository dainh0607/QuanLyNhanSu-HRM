using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Districts")]
    public class Districts : AuditableEntity
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

        // FIX: Foreign key relationship to Provinces.code (not Provinces.Id)
        [ForeignKey(nameof(province_code))]
        public virtual Provinces Province { get; set; } = null!;

        // Wards collection
        public virtual ICollection<Wards> Wards { get; set; } = new HashSet<Wards>();
    }
}
