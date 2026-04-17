using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models.ControlPlane
{
    [Table("Sys_WorkspaceOwnerInvitations")]
    public class WorkspaceOwnerInvitation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string WorkspaceCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string OwnerFullName { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string OwnerEmail { get; set; } = string.Empty;

        [StringLength(20)]
        public string? OwnerPhone { get; set; }

        [Required]
        [StringLength(50)]
        public string TargetPlanCode { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string BillingCycle { get; set; } = string.Empty; // "monthly" | "yearly"

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "invited"; // "invited", "activated", "expired", "revoked"

        [Required]
        [StringLength(200)]
        public string ActivationToken { get; set; } = string.Empty;

        [StringLength(150)]
        public string InvitedBy { get; set; } = string.Empty; // Email của Super Admin

        [StringLength(500)]
        public string? Note { get; set; }

        public DateTime InvitedAt { get; set; } = DateTime.UtcNow;

        public DateTime LastSentAt { get; set; } = DateTime.UtcNow;

        public DateTime ExpiresAt { get; set; }

        public DateTime? ActivatedAt { get; set; }
    }
}
