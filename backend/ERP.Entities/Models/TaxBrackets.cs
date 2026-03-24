using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("TaxBrackets")]
    public class TaxBrackets : BaseEntity
    {
        [Column("from_income")]
        public decimal from_income { get; set; }

        [Column("to_income")]
        public decimal? to_income { get; set; }

        [Column("tax_rate")]
        public decimal tax_rate { get; set; }

        [Column("effective_date")]
        public DateTime effective_date { get; set; }

        [Column("expiry_date")]
        public DateTime? expiry_date { get; set; }
    }
}
