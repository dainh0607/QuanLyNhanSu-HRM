using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Branches")]
    public class Branches : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [StringLength(200)]
        public string name { get; set; } = null!;

        [Column("region_id")]
        public int? region_id { get; set; }

        [ForeignKey("region_id")]
        public virtual Regions? Region { get; set; }

        [Column("code")]
        [StringLength(50)]
        public string code { get; set; } = null!;

        [Column("parent_id")]
        public int? parent_id { get; set; }

        [ForeignKey("parent_id")]
        public virtual Branches? ParentBranch { get; set; }

        [Column("country_code")]
        [StringLength(10)]
        public string? country_code { get; set; }

        [Column("province_code")]
        [StringLength(10)]
        public string? province_code { get; set; }

        [Column("district_code")]
        [StringLength(10)]
        public string? district_code { get; set; }

        [Column("address")]
        [StringLength(255)]
        public string? address { get; set; }

        [Column("phone_country_prefix")]
        [StringLength(10)]
        public string? phone_country_prefix { get; set; }

        [Column("phone_number")]
        [StringLength(20)]
        public string? phone_number { get; set; }

        [Column("color_code")]
        [StringLength(20)]
        public string? color_code { get; set; }

        [Column("display_order")]
        public int display_order { get; set; } = 0;

        [Column("note")]
        [StringLength(500)]
        public string? note { get; set; }

        public virtual ICollection<Branches> SubBranches { get; set; } = new HashSet<Branches>();
        public virtual ICollection<Employees> Employees { get; set; } = new HashSet<Employees>();
        public virtual ICollection<Employees> SecondaryEmployees { get; set; } = new HashSet<Employees>();
        public virtual ICollection<Departments> Departments { get; set; } = new HashSet<Departments>();
    }
}
