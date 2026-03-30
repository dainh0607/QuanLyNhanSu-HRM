using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;

namespace ERP.Services.Employees
{
    public interface IEmployeeProfileService
    {
        Task<bool> UpdateBankAccountsAsync(int employeeId, List<BankAccountDto> dtos);
        Task<bool> UpdateEmergencyContactsAsync(int employeeId, List<EmergencyContactDto> dtos);
        Task<bool> UpdateHealthRecordAsync(int employeeId, HealthRecordDto dto);
        Task<bool> UpdateAddressesAsync(int employeeId, List<EmployeeAddressDto> dtos);
        Task<bool> UpdateEducationAsync(int employeeId, List<EducationDto> dtos);
        Task<bool> UpdateSkillsAsync(int employeeId, List<EmployeeSkillDto> dtos);
        Task<bool> UpdateCertificatesAsync(int employeeId, List<EmployeeCertificateDto> dtos);
        Task<bool> UpdateDependentsAsync(int employeeId, List<DependentDto> dtos);
    }
}
