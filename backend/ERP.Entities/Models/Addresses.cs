using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Addresses")]
    public class Addresses : BaseEntity
    {
        [Column("address_line")]
        [StringLength(255)]
        public string address_line { get; set; }

        [Column("ward")]
        [StringLength(100)]
        public string ward { get; set; }

        [Column("district")]
        [StringLength(100)]
        public string district { get; set; }

        [Column("city")]
        [StringLength(100)]
        public string city { get; set; }

        [Column("country")]
        [StringLength(100)]
        public string country { get; set; }

        [Column("postal_code")]
        [StringLength(20)]
        public string postal_code { get; set; }
    }
}
