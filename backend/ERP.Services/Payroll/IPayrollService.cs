using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;

namespace ERP.Services.Payroll
{
    public interface IPayrollService
    {
        Task<PaginatedListDto<object>> GetPayrollsAsync(int month, int year, int skip, int take);
        Task<object?> GetPayrollDetailAsync(int payrollId);
        Task<bool> GeneratePayrollsAsync(int month, int year);
        Task<bool> ApprovePayrollAsync(int payrollId, int approvedBy);
    }
}
