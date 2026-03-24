using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("LocationHistory")]
    public class LocationHistory : BaseEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("latitude")]
        public decimal latitude { get; set; }

        [Column("longitude")]
        public decimal longitude { get; set; }

        [Column("timestamp")]
        public DateTime timestamp { get; set; }

        [Column("source")]
        [StringLength(50)]
        public string source { get; set; }
    }
}
