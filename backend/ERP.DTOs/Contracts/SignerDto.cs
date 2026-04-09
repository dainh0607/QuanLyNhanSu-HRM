using System.Collections.Generic;

namespace ERP.DTOs.Contracts
{
    public class SignerAssignedFieldDto
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public int PageNumber { get; set; }
        public float XPos { get; set; }
        public float YPos { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }
    }

    public class GenerateOtpDto
    {
        public string SignatureToken { get; set; }
    }

    public class VerifyOtpDto
    {
        public string SignatureToken { get; set; }
        public string Otp { get; set; }
    }

    public class SignerAuthResponseDto
    {
        public string AccessToken { get; set; }
        public int SignerId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public int ContractId { get; set; }
        public string ContractNumber { get; set; }
        public string Status { get; set; }
        public List<SignerAssignedFieldDto> AssignedFields { get; set; } = new();
    }

    public class CompleteSigningFieldDto
    {
        public int PositionId { get; set; }
        public string SignatureDataUrl { get; set; }
        public string SignatureMethod { get; set; }
    }

    public class CompleteSigningDto
    {
        public bool AcceptedAgreement { get; set; }
        public List<CompleteSigningFieldDto> Fields { get; set; } = new();
    }

    public class CompleteSigningResponseDto
    {
        public bool IsCompleted { get; set; }
        public bool ContractFullySigned { get; set; }
        public bool NotifiedNextSigner { get; set; }
    }
}
