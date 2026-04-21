using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;

namespace ERP.Services.Employees
{
    public interface ISalaryConfigurationService
    {
        Task<SalaryPackageDto> GetSalaryPackageAsync(int employeeId);
        Task<bool> UpdateSalaryPackageAsync(int employeeId, SalaryPackageDto dto);
        
        Task<SalaryGradeDto> CreateSalaryGradeAsync(SalaryGradeCreateDto dto);
        Task<IEnumerable<SalaryGradeDto>> GetSalaryGradesAsync();
        Task<IEnumerable<LookupDto>> GetAllowanceTypesAsync();
        Task<IEnumerable<LookupDto>> GetIncomeTypesAsync();
    }

    public class LookupDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
