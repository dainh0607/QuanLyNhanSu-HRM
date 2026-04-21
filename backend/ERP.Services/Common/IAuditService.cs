using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using ERP.DTOs.Common;

namespace ERP.Services.Common
{
    public interface IAuditService
    {
        Task RecordLogAsync(string action, string entityType, int? entityId, string content, int? employeeId = null, int? statusCode = null, string? requestUrl = null);
        Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync(int employeeId, string? keyword, DateTime? fromDate, DateTime? toDate, int skip = 0, int take = 50);
        Task<byte[]> ExportAuditLogsToExcelAsync(int employeeId, string? keyword, DateTime? fromDate, DateTime? toDate);
    }
}
