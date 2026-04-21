using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;

namespace ERP.Services.Employees
{
    public interface IInsuranceService
    {
        Task<IEnumerable<InsuranceListItemDto>> GetInsurancesByEmployeeIdAsync(int employeeId);
        Task<InsuranceDto?> GetInsuranceByIdAsync(int id);
        Task<bool> CreateInsuranceAsync(InsuranceCreateDto dto);
        Task<bool> DeleteInsuranceAsync(int id);
    }
}
