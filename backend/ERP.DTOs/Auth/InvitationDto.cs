using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Auth
{
    public class InvitationRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        public int? EmployeeId { get; set; }
        
        public int ExpirationDays { get; set; } = 7;
    }

    public class InvitationResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string InvitationLink { get; set; }
        public string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class InvitationValidationDto
    {
        public bool Valid { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Message { get; set; }
    }
}
