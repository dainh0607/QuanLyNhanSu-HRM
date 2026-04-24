using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Wards")]
    public class Wards : AuditableEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        [Column("code")]
        public string code { get; set; } = null!;

        [Required]
        [StringLength(100)]
        [Column("name")]
        public string name { get; set; } = null!;

        [Column("district_code")]
        [StringLength(20)]
        public string district_code { get; set; } = null!;

        [ForeignKey(nameof(district_code))]
        public virtual Districts District { get; set; } = null!;
    }
}
