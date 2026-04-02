using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Employees;

using ERP.DTOs.Employees.Profile;

namespace ERP.Services.Employees
{
    public interface IEmployeeService
    {
        Task<PaginatedListDto<EmployeeDto>> GetPagedListAsync(EmployeeFilterDto filter);
        Task<EmployeeDto?> GetByIdAsync(int id);
        Task<EmployeeFullProfileDto?> GetFullProfileAsync(int id);
        Task<EmployeeDto?> GetByCodeAsync(string code);
        Task<EmployeeDto> CreateAsync(EmployeeCreateDto dto);
        Task<bool> UpdateAsync(int id, EmployeeUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<string> GenerateNextEmployeeCodeAsync(string prefix = "NV");
        Task<string> GetCodeForReturningEmployeeAsync(int employeeId, string prefix = "NV");
        Task<byte[]> ExportEmployeesToCsvAsync(EmployeeFilterDto filter, IEnumerable<string>? columns = null);
    }
}
