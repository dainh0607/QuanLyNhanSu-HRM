using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models.ControlPlane
{
    [Table("Sys_InvoiceMetadata")]
    public class InvoiceMetadata
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string InvoiceCode { get; set; } = string.Empty;

        [Required]
        public int TenantId { get; set; }

        [Required]
        [StringLength(50)]
        public string WorkspaceCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string BillingPeriodLabel { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountVnd { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "draft"; // "paid", "upcoming", "overdue", "draft"

        [StringLength(200)]
        public string? PaymentGatewayRef { get; set; }

        public DateTime IssuedAt { get; set; }

        public DateTime DueAt { get; set; }

        [StringLength(500)]
        public string? SummaryNote { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("TenantId")]
        public Tenants? Tenant { get; set; }
    }
}
