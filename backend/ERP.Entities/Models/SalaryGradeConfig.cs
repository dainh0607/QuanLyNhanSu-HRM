using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("SalaryGradeConfig")]
    public class SalaryGradeConfig : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("job_title_id")]
        public int job_title_id { get; set; }

        [ForeignKey("job_title_id")]
        public virtual JobTitles JobTitle { get; set; }

        [Column("grade_code")]
        [StringLength(50)]
        public string grade_code { get; set; }

        [Column("base_salary")]
        public decimal base_salary { get; set; }

        [Column("coefficient")]
        public decimal coefficient { get; set; }

        [Column("effective_date")]
        public DateTime effective_date { get; set; }

        [Column("expiry_date")]
        public DateTime? expiry_date { get; set; }
    }
}
