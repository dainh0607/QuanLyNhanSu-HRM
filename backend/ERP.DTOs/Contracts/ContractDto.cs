using System;

namespace ERP.DTOs.Contracts
{
    public class ContractDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string ContractNumber { get; set; }
        public int? ContractTypeId { get; set; }
        public string ContractTypeName { get; set; }
        public DateTime? SignDate { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string SignedBy { get; set; }
        public string TaxType { get; set; }
        public string Attachment { get; set; }
        public string Status { get; set; }
    }

    public class ContractCreateDto
    {
        public int EmployeeId { get; set; }
        public string ContractNumber { get; set; }
        public int? ContractTypeId { get; set; }
        public DateTime? SignDate { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string SignedBy { get; set; }
        public string TaxType { get; set; }
        public string? Attachment { get; set; }
        public string? Status { get; set; } = "Draft";
        public bool IsElectronic { get; set; } = false;
        public string? Note { get; set; }
        public int? TemplateId { get; set; }
    }

    public class ElectronicContractDraftDto
    {
        public int EmployeeId { get; set; }
        public string? ContractNumber { get; set; } // May be generated later
        public int? ContractTypeId { get; set; }
        public int? TemplateId { get; set; }
        public string? Note { get; set; }
        public DateTime? EffectiveDate { get; set; }
    }

    public class ContractSignerDto
    {
        public int? Id { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public int SignOrder { get; set; }
        public string? Status { get; set; } = "Pending";
        public DateTime? SignedAt { get; set; }
        public string? SignatureToken { get; set; }
        public string? Note { get; set; }
        public int? UserId { get; set; } // Optional: for internal users
    }

    public class ContractStep3Dto
    {
        public int ContractId { get; set; }
        public List<ContractSignerDto> Signers { get; set; }
    }

    public class ContractSignerPositionDto
    {
        public int SignerId { get; set; }
        public string Type { get; set; }
        public int PageNumber { get; set; }
        public float XPos { get; set; }
        public float YPos { get; set; }
        public float? Width { get; set; }
        public float? Height { get; set; }
    }

    public class ContractStep4Dto
    {
        public int ContractId { get; set; }
        public List<ContractSignerPositionDto> Positions { get; set; }
    }

    public class ContractSubmitDto
    {
        public int ContractId { get; set; }
    }

    public class ElectronicContractSubmitResultDto
    {
        public string Message { get; set; } = string.Empty;
        public bool NotificationSent { get; set; }
        public string? WarningMessage { get; set; }
    }

    public class ContractUpdateDto
    {
        public string ContractNumber { get; set; }
        public int? ContractTypeId { get; set; }
        public DateTime? SignDate { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string SignedBy { get; set; }
        public string TaxType { get; set; }
        public string? Attachment { get; set; }
        public string? Status { get; set; }
        public bool? IsElectronic { get; set; }
        public string? Note { get; set; }
        public int? TemplateId { get; set; }
    }
}
