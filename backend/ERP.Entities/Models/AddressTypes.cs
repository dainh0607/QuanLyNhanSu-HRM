using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AddressTypes")]
    public class AddressTypes : BaseEntity
    {
        [Column("name")]
        [StringLength(50)]
        public string name { get; set; }
    }
}
