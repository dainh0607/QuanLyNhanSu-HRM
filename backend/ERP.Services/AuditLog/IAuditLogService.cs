using System.Threading.Tasks;
using ERP.DTOs.AuditLog;

namespace ERP.Services.AuditLog
{
    public interface IAuditLogService
    {
        Task<AuditLogListResultDto> GetAuditLogsAsync(AuditLogFilterDto filter);
        Task<int> CreateAuditLogAsync(AuditLogCreateDto dto, int? userId, string ipAddress, string device, string os, string macAddress);
    }
}
