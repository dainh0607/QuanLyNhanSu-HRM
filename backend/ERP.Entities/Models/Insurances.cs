using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Insurances")]
    public class Insurances : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("social_insurance_no")]
        [StringLength(50)]
        public string? social_insurance_no { get; set; }

        [Column("health_insurance_no")]
        [StringLength(50)]
        public string? health_insurance_no { get; set; }

        [Column("is_book_submitted")]
        public bool is_book_submitted { get; set; }

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

        [Column("company_social_rate")]
        public decimal? company_social_rate { get; set; }

        [Column("company_health_rate")]
        public decimal? company_health_rate { get; set; }

        [Column("company_unemployment_rate")]
        public decimal? company_unemployment_rate { get; set; }

        [Column("employee_social_rate")]
        public decimal? employee_social_rate { get; set; }

        [Column("employee_health_rate")]
        public decimal? employee_health_rate { get; set; }

        [Column("employee_unemployment_rate")]
        public decimal? employee_unemployment_rate { get; set; }

        [Column("birth_place_address_id")]
        public int? birth_place_address_id { get; set; }

        [ForeignKey("birth_place_address_id")]
        public virtual Addresses? BirthPlaceAddress { get; set; }

        [Column("residence_address_id")]
        public int? residence_address_id { get; set; }

        [ForeignKey("residence_address_id")]
        public virtual Addresses? ResidenceAddress { get; set; }

        [Column("contact_address_id")]
        public int? contact_address_id { get; set; }

        [ForeignKey("contact_address_id")]
        public virtual Addresses? ContactAddress { get; set; }

        [Column("note")]
        public string? note { get; set; }
    }
}
