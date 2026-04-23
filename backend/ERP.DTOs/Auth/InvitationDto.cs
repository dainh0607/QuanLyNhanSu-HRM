using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Auth
{
    public class InvitationRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        public int? EmployeeId { get; set; }

        public int? DepartmentId { get; set; }

        public int? JobTitleId { get; set; }

        public int? RoleId { get; set; }

        public string? ScopeLevel { get; set; }

        public int? BranchId { get; set; }

        public int? RegionId { get; set; }

        public string? Message { get; set; }
        
        public int ExpirationDays { get; set; } = 7;
    }

    public class InvitationResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string InvitationLink { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    public class InvitationValidationDto
    {
        public bool Valid { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int? DepartmentId { get; set; }
        public int? JobTitleId { get; set; }
        public int? RoleId { get; set; }
        public string? ScopeLevel { get; set; }
        public int? BranchId { get; set; }
        public int? RegionId { get; set; }
        public string? Message { get; set; }
        public string InvitationMessage { get; set; } = string.Empty;
    }
}
