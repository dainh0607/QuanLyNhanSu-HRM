using System;

namespace ERP.DTOs.Employees.Profile
{
    public class DependentDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Gender { get; set; }
        public string IdentityNumber { get; set; }
        public string Relationship { get; set; }
        public string PermanentAddress { get; set; }
        public string TemporaryAddress { get; set; }
        public string DependentDuration { get; set; }
        public string Reason { get; set; }
    }
}
