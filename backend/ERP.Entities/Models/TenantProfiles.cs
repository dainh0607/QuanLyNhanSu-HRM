using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("TenantProfiles")]
    public class TenantProfiles : AuditableEntity
    {
        [Column("tenant_id")]
        public int tenant_id { get; set; }

        [ForeignKey("tenant_id")]
        public virtual Tenants Tenant { get; set; }

        [Column("company_email")]
        [StringLength(100)]
        public string? company_email { get; set; }

        [Column("establishment_date")]
        public DateTime? establishment_date { get; set; }

        [Column("company_size")]
        [StringLength(50)]
        public string? company_size { get; set; }

        [Column("charter_capital")]
        public decimal? charter_capital { get; set; }

        [Column("bank_name")]
        [StringLength(100)]
        public string? bank_name { get; set; }

        [Column("bank_account_no")]
        [StringLength(50)]
        public string? bank_account_no { get; set; }

        [Column("tax_code")]
        [StringLength(50)]
        public string? tax_code { get; set; }

        [Column("address")]
        [StringLength(500)]
        public string? address { get; set; }

        [Column("country_code")]
        [StringLength(10)]
        public string? country_code { get; set; }

        [Column("province_code")]
        [StringLength(10)]
        public string? province_code { get; set; }

        [Column("district_code")]
        [StringLength(10)]
        public string? district_code { get; set; }

        [Column("date_format")]
        [StringLength(20)]
        public string date_format { get; set; } = "DD/MM/YYYY";

        [Column("time_format")]
        [StringLength(20)]
        public string time_format { get; set; } = "24H";

        [Column("notes")]
        [StringLength(1000)]
        public string? notes { get; set; }
    }
}
