using System;

namespace ERP.DTOs.Employees.Profile
{
    public class EducationDto
    {
        public int Id { get; set; }
        public string Level { get; set; }
        public string Major { get; set; }
        public string Institution { get; set; }
        public DateTime? IssueDate { get; set; }
        public string Note { get; set; }
    }
}
