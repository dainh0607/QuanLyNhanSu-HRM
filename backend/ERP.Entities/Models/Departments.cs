using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Departments")]
    public class Departments : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Required]
        [StringLength(100)]
        [Column("name")]
        public string name { get; set; } = null!;

        [Required]
        [StringLength(50)]
        [Column("code")]
        public string code { get; set; } = null!;

        [Column("parent_id")]
        public int? parent_id { get; set; }

        [ForeignKey("parent_id")]
        public virtual Departments? ParentDepartment { get; set; }

        [Column("branch_id")]
        public int? branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches? Branch { get; set; }

        [Column("is_head_department")]
        public bool is_head_department { get; set; }

        [Column("display_order")]
        public int display_order { get; set; } = 0;

        [Column("note")]
        [StringLength(500)]
        public string? note { get; set; }

        public virtual ICollection<Departments> SubDepartments { get; set; } = new HashSet<Departments>();
        public virtual ICollection<Employees> Employees { get; set; } = new HashSet<Employees>();
        public virtual ICollection<Employees> SecondaryEmployees { get; set; } = new HashSet<Employees>();
    }
}
