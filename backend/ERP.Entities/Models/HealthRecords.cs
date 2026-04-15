using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("HealthRecords")]
    public class HealthRecords : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("height")]
        public decimal? height { get; set; }

        [Column("weight")]
        public decimal? weight { get; set; }

        [Column("blood_type")]
        [StringLength(5)]
        public string blood_type { get; set; }

        [Column("congenital_disease")]
        [StringLength(255)]
        public string congenital_disease { get; set; }

        [Column("chronic_disease")]
        [StringLength(255)]
        public string chronic_disease { get; set; }

        [Column("health_status")]
        [StringLength(50)]
        public string health_status { get; set; }

        [Column("check_date")]
        public DateTime? check_date { get; set; }
    }
}
