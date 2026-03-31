using System;

namespace ERP.DTOs.Employees.Profile
{
    public class IdentityInfoDto
    {
        public string? IdentityNumber { get; set; }
        public DateTime? IdentityIssueDate { get; set; }
        public string? IdentityIssuePlace { get; set; }
        public string? Passport { get; set; }
        public string? Nationality { get; set; }
        public string? Ethnicity { get; set; }
        public string? Religion { get; set; }
    }
}
