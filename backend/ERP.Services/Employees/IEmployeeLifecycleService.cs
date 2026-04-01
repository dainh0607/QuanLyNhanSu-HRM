using System.Threading.Tasks;
using ERP.DTOs.Employees;

namespace ERP.Services.Employees
{
    public interface IEmployeeLifecycleService
    {
        /// <summary>
        /// Xử lý nhân viên nghỉ việc
        /// </summary>
        Task<bool> ProcessResignationAsync(int employeeId, ResignationRequestDto dto);

        /// <summary>
        /// Xử lý thăng tiến/thay đổi vị trí nhân viên
        /// </summary>
        Task<bool> ProcessPromotionAsync(int employeeId, PromotionRequestDto dto);
    }
}
