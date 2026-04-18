using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.ControlPlane
{
    public class WorkspaceActivationSessionDto
    {
        public string Token { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string WorkspaceCode { get; set; } = string.Empty;
        public string OwnerFullName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public string IssuedAt { get; set; } = string.Empty;
        public string ExpiresAt { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string InvitedBy { get; set; } = string.Empty;
        public string SupportContactEmail { get; set; } = "support@nexahrm.com";
        public string ActivationPolicy { get; set; } = "owner-sets-password";
        public string[] Instructions { get; set; } = System.Array.Empty<string>();
    }

    public class WorkspaceActivationResultDto
    {
        public bool Success { get; set; }
        public string Status { get; set; } = string.Empty;
        public WorkspaceActivationSessionDto? Session { get; set; }
        public string? Message { get; set; }
    }

    public class WorkspaceActivationPayloadDto
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
