using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("PayrollPeriods")]
    public class PayrollPeriods : AuditableEntity
    {
        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("status")]
        [StringLength(20)]
        public string status { get; set; }

        public virtual ICollection<Payrolls> Payrolls { get; set; } = new HashSet<Payrolls>();
    }
}
