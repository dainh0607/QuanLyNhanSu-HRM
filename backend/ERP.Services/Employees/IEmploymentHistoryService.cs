using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Employees;

namespace ERP.Services.Employees
{
    public interface IEmploymentHistoryService
    {
        Task<PaginatedListDto<EmploymentHistoryLogDto>> GetPagedListAsync(EmploymentHistoryFilterDto filter);
        Task<bool> DeleteAsync(int id);
        Task<bool> BulkDeleteAsync(int[] ids);
        Task<byte[]> ExportExcelAsync(EmploymentHistoryFilterDto filter);
        
        /// <summary>
        /// Internal method to create a log entry from other services
        /// </summary>
        Task CreateLogAsync(EmploymentHistoryLogDto logDto);
    }
}
