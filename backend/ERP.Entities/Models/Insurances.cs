using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Insurances")]
    public class Insurances : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; } = null!;

        [Column("social_insurance_no")]
        [StringLength(50)]
        public string? social_insurance_no { get; set; }

        [Column("health_insurance_no")]
        [StringLength(50)]
        public string? health_insurance_no { get; set; }

        [Column("position")]
        [StringLength(100)]
        public string? position { get; set; }

        [Column("medical_history")]
        public string? medical_history { get; set; }

        [Column("maternity_regime")]
        [StringLength(255)]
        public string? maternity_regime { get; set; }

        [Column("registration_place")]
        [StringLength(200)]
        public string? registration_place { get; set; }

        [Column("join_date")]
        public DateTime? join_date { get; set; }

        [Column("salary_for_insurance")]
        public decimal? salary_for_insurance { get; set; }

        [Column("union_fee")]
        public decimal? union_fee { get; set; }

        [Column("company_pays_health")]
        public bool? company_pays_health { get; set; }

        [Column("company_pays_social")]
        public bool? company_pays_social { get; set; }

        [Column("company_pays_unemployment")]
        public bool? company_pays_unemployment { get; set; }

        [Column("employee_pays_health")]
        public bool? employee_pays_health { get; set; }

        [Column("employee_pays_social")]
        public bool? employee_pays_social { get; set; }

        [Column("employee_pays_unemployment")]
        public bool? employee_pays_unemployment { get; set; }

        [Column("note")]
        public string? note { get; set; }

        [Column("birth_place_address_id")]
        public int? birth_place_address_id { get; set; }

        [Column("residence_address_id")]
        public int? residence_address_id { get; set; }

        [Column("contact_address_id")]
        public int? contact_address_id { get; set; }
    }
}
