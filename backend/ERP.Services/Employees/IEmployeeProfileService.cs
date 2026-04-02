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
        Task<bool> UpdateAddressesAsync(int employeeId, AddressProfileUpdateDto dto);
        Task<bool> UpdateEducationAsync(int employeeId, List<EducationDto> dtos);
        Task<bool> UpdateSkillsAsync(int employeeId, List<EmployeeSkillDto> dtos);
        Task<bool> UpdateCertificatesAsync(int employeeId, List<EmployeeCertificateDto> dtos);
        Task<bool> UpdateDependentsAsync(int employeeId, List<DependentDto> dtos);
        Task<bool> UpdateIdentityInfoAsync(int employeeId, IdentityInfoDto dto);
        Task<bool> UpdateContactInfoAsync(int employeeId, ContactInfoDto dto);
        Task<bool> UpdateBasicInfoAsync(int employeeId, BasicInfoDto dto);
        Task<bool> UpdateAvatarAsync(int employeeId, string? avatar);
        Task<bool> UpdateWorkHistoryAsync(int employeeId, List<WorkHistoryDto> dtos);
        Task<OtherInfoDto?> GetOtherInfoAsync(int employeeId);
        Task<OtherInfoDto?> GetOtherInfoDetailsAsync(int employeeId);
        Task<bool> UpdateOtherInfoAsync(int employeeId, OtherInfoDto dto);
    }
}
