using System;

namespace ERP.DTOs.Contracts
{
    public class ContractListItemDto
    {
        public int Id { get; set; }
        public string ContractNumber { get; set; }
        public string Status { get; set; }
        
        // Formatted for UI
        public string StatusLabel { get; set; }
        public string StatusColor { get; set; }

        public DateTime? SignDate { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public DateTime? ExpiryDate { get; set; }

        // Employee info
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public string BranchName { get; set; }
        public string DepartmentName { get; set; }
        public string JobTitleName { get; set; }

        // Contract type
        public int? ContractTypeId { get; set; }
        public string ContractTypeName { get; set; }
        
        // Other fields from frontend requirements
        public string SignedBy { get; set; }
        public string TaxType { get; set; }
        public string Attachment { get; set; }
    }
}
