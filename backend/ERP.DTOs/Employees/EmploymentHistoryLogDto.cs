using System;

namespace ERP.DTOs.Employees
{
    public class EmploymentHistoryLogDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string FullName { get; set; }
        public DateTime EffectiveDate { get; set; }
        
        public int? DecisionTypeId { get; set; }
        public string DecisionTypeName { get; set; }
        
        public int? ContractTypeId { get; set; }
        public string ContractTypeName { get; set; }
        
        public string DecisionNumber { get; set; }
        public string WorkStatus { get; set; }
        
        public int? ProvinceId { get; set; }
        public string ProvinceName { get; set; }
        
        public int? DistrictId { get; set; }
        public string DistrictName { get; set; }
        
        public string ChangeType { get; set; }
        public string Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
