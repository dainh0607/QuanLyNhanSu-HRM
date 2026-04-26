using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    [Table("ShiftJobs")]
    public class ShiftJobs : AuditableEntity, ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [Required]
        [MaxLength(100)]
        public string name { get; set; } = null!;

        [Column("code")]
        [Required]
        [MaxLength(50)]
        public string code { get; set; } = null!;

        [Column("branch_id")]
        public int branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches Branch { get; set; } = null!;

        [Column("color_code")]
        [MaxLength(20)]
        public string? color_code { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;

        [Column("description")]
        public string? description { get; set; }

        public virtual ICollection<ShiftJobDepartments> ShiftJobDepartments { get; set; } = new HashSet<ShiftJobDepartments>();
        public virtual ICollection<ShiftJobEmployees> ShiftJobEmployees { get; set; } = new HashSet<ShiftJobEmployees>();
    }
}
