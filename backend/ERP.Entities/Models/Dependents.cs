using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Dependents")]
    public class Dependents : BaseEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("full_name")]
        [StringLength(100)]
        public string full_name { get; set; }

        [Column("birth_date")]
        public DateTime? birth_date { get; set; }

        [Column("gender")]
        [StringLength(10)]
        public string? gender { get; set; }

        [Column("identity_number")]
        [StringLength(20)]
        public string identity_number { get; set; }

        [Column("relationship")]
        [StringLength(50)]
        public string relationship { get; set; }

        [Column("permanent_address")]
        [StringLength(255)]
        public string permanent_address { get; set; }

        [Column("temporary_address")]
        [StringLength(255)]
        public string temporary_address { get; set; }

        [Column("dependent_duration")]
        [StringLength(50)]
        public string dependent_duration { get; set; }

        [Column("reason")]
        [StringLength(255)]
        public string reason { get; set; }
    }
}
