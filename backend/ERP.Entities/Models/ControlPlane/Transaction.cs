using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models.ControlPlane
{
    [Table("Sys_Transactions")]
    public class Transaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int InvoiceId { get; set; }

        [Required]
        public int TenantId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountVnd { get; set; }

        [Required]
        [StringLength(50)]
        public string PaymentSource { get; set; } = "manual"; // "manual", "vnpay", "stripe", "momo"

        [StringLength(200)]
        public string? ExternalReference { get; set; } // Mã bút toán ngân hàng hoặc ID từ cổng thanh toán

        [StringLength(500)]
        public string? Note { get; set; }

        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("InvoiceId")]
        public InvoiceMetadata? Invoice { get; set; }

        [ForeignKey("TenantId")]
        public Tenants? Tenant { get; set; }
    }
}
