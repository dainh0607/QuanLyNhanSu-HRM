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
        Task<int> CreateBulkAsync(EmployeeBulkCreateDto dto);
        Task<bool> UpdateAsync(int id, EmployeeUpdateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<string> GenerateNextEmployeeCodeAsync(string prefix = "NV");
        Task<string> GetCodeForReturningEmployeeAsync(int employeeId, string prefix = "NV");
        Task<IEnumerable<EmployeeDto>> GetActiveByBranchAsync(int branchId);
        Task<byte[]> ExportEmployeesToCsvAsync(EmployeeFilterDto filter, IEnumerable<string>? columns = null);
        Task<EmployeeWorkStatusDto?> GetWorkStatusAsync(int employeeId);
        Task<bool> UpdateWorkStatusAsync(int employeeId, EmployeeWorkStatusDto dto);
        Task<IEnumerable<EmployeeSearchDto>> SearchEmployeesAsync(string term, int? excludeId = null);
        Task<EmployeeJobInfoDto?> GetJobInfoAsync(int employeeId);
        Task<bool> UpdateJobInfoAsync(int employeeId, EmployeeJobInfoDto dto);
    }
}
