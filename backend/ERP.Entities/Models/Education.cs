using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Education")]
    public class Education : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; } = null!;

        [Column("level")]
        [StringLength(50)]
        public string level { get; set; } = null!;

        [Column("major")]
        [StringLength(100)]
        public string major { get; set; } = null!;

        [Column("major_id")]
        public int? major_id { get; set; }

        [ForeignKey("major_id")]
        public virtual Majors? MajorEntity { get; set; }

        [Column("institution")]
        [StringLength(200)]
        public string institution { get; set; } = null!;

        [Column("issue_date")]
        public DateTime? issue_date { get; set; }

        [Column("note")]
        public string? note { get; set; }
    }
}
