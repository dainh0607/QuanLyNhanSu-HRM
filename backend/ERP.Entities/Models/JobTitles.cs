using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("JobTitles")]
    public class JobTitles : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [StringLength(200)]
        public string name { get; set; } = null!;

        [Column("code")]
        [StringLength(50)]
        public string code { get; set; } = null!;

        [Column("parent_id")]
        public int? parent_id { get; set; }

        [ForeignKey("parent_id")]
        public virtual JobTitles? ParentJobTitle { get; set; }

        [Column("branch_id")]
        public int? branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches? Branch { get; set; }

        [Column("department_id")]
        public int? department_id { get; set; }

        [ForeignKey("department_id")]
        public virtual Departments? Department { get; set; }

        [Column("qualification")]
        [StringLength(100)]
        public string? qualification { get; set; }

        [Column("experience")]
        [StringLength(200)]
        public string? experience { get; set; }

        [Column("display_order")]
        public int display_order { get; set; } = 0;

        [Column("note")]
        [StringLength(500)]
        public string? note { get; set; }

        public virtual ICollection<JobTitles> SubJobTitles { get; set; } = new HashSet<JobTitles>();
        public virtual ICollection<Employees> Employees { get; set; } = new HashSet<Employees>();
    }
}
