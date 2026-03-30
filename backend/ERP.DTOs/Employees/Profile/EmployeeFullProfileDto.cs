using System.Collections.Generic;

namespace ERP.DTOs.Employees.Profile
{
    public class EmployeeFullProfileDto
    {
        public EmployeeDto BasicInfo { get; set; }
        public List<EmployeeAddressDto> Addresses { get; set; } = new();
        public List<BankAccountDto> BankAccounts { get; set; } = new();
        public List<EmergencyContactDto> EmergencyContacts { get; set; } = new();
        public HealthRecordDto? HealthRecord { get; set; }
        public List<DependentDto> Dependents { get; set; } = new();
        public List<EducationDto> Education { get; set; } = new();
        public List<EmployeeCertificateDto> Certificates { get; set; } = new();
        public List<EmployeeSkillDto> Skills { get; set; } = new();
    }
}
