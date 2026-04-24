using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Payroll;

namespace ERP.Services.Payroll
{
    public interface IPayrollConfigService
    {
        // Salary Grades
        Task<List<SalaryGradeConfigDto>> GetSalaryGradesAsync(string paymentType);
        Task<SalaryGradeConfigDto> CreateSalaryGradeAsync(SalaryGradeConfigDto dto);
        Task<SalaryGradeConfigDto> UpdateSalaryGradeAsync(int id, SalaryGradeConfigDto dto);
        Task<(bool success, string message)> DeleteSalaryGradeAsync(int id);

        // Variables (Allowance, Advance, Other)
        Task<List<PayrollVariableDto>> GetVariablesAsync(string category);
        Task<PayrollVariableDto> CreateVariableAsync(PayrollVariableDto dto);
        Task<PayrollVariableDto> UpdateVariableAsync(int id, PayrollVariableDto dto);
        Task<(bool success, string message)> DeleteVariableAsync(int id, string category);
    }
}
