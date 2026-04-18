using System.Threading.Tasks;

namespace ERP.Services.Common
{
    public interface IAuditService
    {
        Task RecordLogAsync(string action, string entityType, int? entityId, string content);
    }
}
