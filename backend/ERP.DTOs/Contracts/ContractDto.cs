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
        public string Attachment { get; set; }
        public string Status { get; set; } = "Draft";
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
        public string Attachment { get; set; }
        public string Status { get; set; }
    }
}
