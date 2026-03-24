using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("MaritalStatuses")]
    public class MaritalStatuses : BaseEntity
    {
        [Column("code")]
        [StringLength(10)]
        public string code { get; set; }

        [Column("name")]
        [StringLength(50)]
        public string name { get; set; }
    }
}
