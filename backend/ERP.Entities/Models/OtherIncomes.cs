using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("OtherIncomes")]
    public class OtherIncomes : BaseEntity
    {
        [Column("salary_id")]
        public int salary_id { get; set; }

        [Column("income_name")]
        [StringLength(100)]
        public string income_name { get; set; }

        [Column("amount")]
        public decimal amount { get; set; }
    }
}
