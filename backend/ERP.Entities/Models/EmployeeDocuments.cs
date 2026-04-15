using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmployeeDocuments")]
    public class EmployeeDocuments : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [ForeignKey("EmployeeId")]
        public virtual Employees Employee { get; set; }

        [Required]
        [StringLength(100)]
        [Column("document_name")]
        public string DocumentName { get; set; }

        [Required]
        [StringLength(50)]
        [Column("document_type")]
        public string DocumentType { get; set; } // CV, ID_Card, Certificate, Other

        [Required]
        [StringLength(512)]
        [Column("file_url")]
        public string FileUrl { get; set; }

        [Column("file_size")]
        public long FileSize { get; set; }

        [StringLength(10)]
        [Column("file_extension")]
        public string FileExtension { get; set; }

        [Column("expiry_date")]
        public DateTime? ExpiryDate { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("note")]
        [StringLength(500)]
        public string Note { get; set; }
    }
}
