using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("DecisionTypes")]
    public class DecisionTypes : BaseEntity
    {
        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }
    }
}
