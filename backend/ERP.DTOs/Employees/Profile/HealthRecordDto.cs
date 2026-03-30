using System;

namespace ERP.DTOs.Employees.Profile
{
    public class HealthRecordDto
    {
        public int Id { get; set; }
        public decimal? Height { get; set; }
        public decimal? Weight { get; set; }
        public string BloodType { get; set; }
        public string CongenitalDisease { get; set; }
        public string ChronicDisease { get; set; }
        public string HealthStatus { get; set; }
        public DateTime? CheckDate { get; set; }
    }
}
