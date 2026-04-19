using System;
using System.Collections.Generic;

namespace ERP.DTOs.Employees
{
    public class EmployeeWorkStatusDto
    {
        public int EmployeeId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? ContractSignDate { get; set; }
        public DateTime? ContractExpiryDate { get; set; }
        public string? WorkType { get; set; }
        public int SeniorityMonths { get; set; }
        public string? Note { get; set; }

        // Late/Early Policy
        public bool IsTotalLateEarlyEnabled { get; set; }
        public int? TotalLateEarlyMinutes { get; set; }
        public List<LateEarlyRuleDto>? TotalLateEarlyRules { get; set; }

        public bool IsSeparateLateEarlyEnabled { get; set; }
        public int? AllowedLateMinutes { get; set; }
        public List<LateEarlyRuleDto>? LateRules { get; set; }
        public int? AllowedEarlyMinutes { get; set; }
        public List<LateEarlyRuleDto>? EarlyRules { get; set; }

        // Resignation
        public bool IsResigned { get; set; }
        public string? ResignationReason { get; set; }
        public DateTime? ResignationDate { get; set; }
    }

    public class LateEarlyRuleDto
    {
        public string Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Minutes { get; set; }
    }
}
