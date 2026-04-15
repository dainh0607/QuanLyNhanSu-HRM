using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Departments")]
    public class Departments : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [StringLength(200)]
        public string name { get; set; }

        [Column("code")]
        [StringLength(50)]
        public string code { get; set; }

        [Column("parent_id")]
        public int? parent_id { get; set; }

        [Column("branch_id")]
        public int? branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches? Branch { get; set; }

        public virtual ICollection<Employees> Employees { get; set; } = new HashSet<Employees>();

        public virtual ICollection<Employees> SecondaryEmployees { get; set; } = new HashSet<Employees>();
    }
}
