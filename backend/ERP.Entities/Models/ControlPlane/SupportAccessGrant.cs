using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models.ControlPlane
{
    [Table("Sys_SupportAccessGrants")]
    public class SupportAccessGrant
    {
        [Key]
        [StringLength(100)]
        public string TicketId { get; set; } = string.Empty;

        [Required]
        public int TenantId { get; set; }

        [Required]
        [StringLength(50)]
        public string WorkspaceCode { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string RequestedScope { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "not_requested"; // "not_requested", "pending_customer_approval", "granted", "expired", "revoked"

        public DateTime? CustomerApprovedAt { get; set; }

        [StringLength(150)]
        public string? ApprovedByCustomerContact { get; set; }

        public DateTime? ExpiresAt { get; set; }

        [StringLength(500)]
        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("TenantId")]
        public Tenants? Tenant { get; set; }
    }
}
