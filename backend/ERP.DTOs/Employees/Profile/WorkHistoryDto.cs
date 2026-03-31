using System;

namespace ERP.DTOs.Employees.Profile
{
    public class WorkHistoryDto
    {
        public string CompanyName { get; set; }
        public string JobTitle { get; set; }
        public string WorkDuration { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
    }
}
