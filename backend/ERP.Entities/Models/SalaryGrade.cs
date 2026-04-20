using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("SalaryGrades")]
    public class SalaryGrade : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [Required]
        [StringLength(100)]
        public string name { get; set; }

        [Column("amount")]
        public decimal amount { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;
    }
}
