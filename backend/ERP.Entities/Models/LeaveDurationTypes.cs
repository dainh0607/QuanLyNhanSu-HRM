using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("LeaveDurationTypes")]
    public class LeaveDurationTypes : BaseEntity
    {
        [Column("name")]
        [StringLength(50)]
        public string name { get; set; }

        [Column("code")]
        [StringLength(20)]
        public string code { get; set; }

        [Column("hours")]
        public decimal? hours { get; set; }
    }
}
