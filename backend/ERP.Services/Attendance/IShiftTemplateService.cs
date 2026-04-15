using System.Threading.Tasks;
using ERP.DTOs.Attendance;

namespace ERP.Services.Attendance
{
    public interface IShiftTemplateService
    {
        Task<int> CreateTemplateAsync(ShiftTemplateCreateDto dto);
        Task<IEnumerable<ShiftTemplateDto>> GetAllTemplatesAsync();
        Task<ShiftTemplateDto?> GetTemplateByIdAsync(int id);
        Task<bool> UpdateTemplateAsync(int id, ShiftTemplateCreateDto dto);
        Task<bool> DeleteTemplateAsync(int id);
    }
}
