using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Employees;

namespace ERP.Services.Employees
{
    public interface IEmployeeService
    {
        Task<PaginatedListDto<EmployeeDto>> GetPagedListAsync(int pageNumber, int pageSize, string? searchTerm, int? departmentId);
        Task<EmployeeDto?> GetByIdAsync(int id);
        Task<EmployeeDto?> GetByCodeAsync(string code);
        Task<EmployeeDto> CreateAsync(EmployeeCreateDto dto);
        Task<bool> UpdateAsync(int id, EmployeeUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
