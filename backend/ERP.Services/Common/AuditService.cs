using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Common;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using ClosedXML.Excel;

namespace ERP.Services.Common
{
    public class AuditService : IAuditService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserContext _userContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditService(IUnitOfWork unitOfWork, ICurrentUserContext userContext, IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _userContext = userContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task RecordLogAsync(string action, string entityType, int? entityId, string content, int? employeeId = null, int? statusCode = null, string? requestUrl = null)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var remoteIp = httpContext?.Connection?.RemoteIpAddress?.ToString() ?? "unknown";
            var userAgent = httpContext?.Request?.Headers["User-Agent"].ToString() ?? "unknown";

            var log = new AuditLogs
            {
                tenant_id = _userContext.TenantId,
                user_id = _userContext.UserId,
                employee_id = employeeId,
                action = action,
                entity_type = entityType,
                entity_id = entityId,
                content = content,
                ip_address = remoteIp,
                device = userAgent,
                os = ParseOS(userAgent),
                status_code = statusCode,
                request_url = requestUrl,
                timestamp = DateTime.UtcNow
            };

            await _unitOfWork.Repository<AuditLogs>().AddAsync(log);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync(int employeeId, string? keyword, DateTime? fromDate, DateTime? toDate, int skip = 0, int take = 50)
        {
            var query = _unitOfWork.Repository<AuditLogs>().AsQueryable()
                .Where(l => l.employee_id == employeeId);

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(l => l.content.Contains(keyword) || l.action.Contains(keyword));
            }

            if (fromDate.HasValue)
            {
                query = query.Where(l => l.timestamp >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(l => l.timestamp <= toDate.Value);
            }

            return await query
                .OrderByDescending(l => l.timestamp)
                .Skip(skip)
                .Take(take)
                .Select(l => new AuditLogDto
                {
                    Id = l.Id,
                    Action = l.action,
                    EntityType = l.entity_type,
                    EntityId = l.entity_id,
                    Content = l.content,
                    Device = l.device,
                    OS = l.os,
                    IPAddress = l.ip_address,
                    Timestamp = l.timestamp,
                    StatusCode = l.status_code,
                    RequestUrl = l.request_url
                })
                .ToListAsync();
        }

        public async Task<byte[]> ExportAuditLogsToExcelAsync(int employeeId, string? keyword, DateTime? fromDate, DateTime? toDate)
        {
            var logs = await GetAuditLogsAsync(employeeId, keyword, fromDate, toDate, 0, 1000); // Limit to 1000 for export

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Audit Logs");
                var currentRow = 1;

                // Headers
                worksheet.Cell(currentRow, 1).Value = "STT";
                worksheet.Cell(currentRow, 2).Value = "Thời gian";
                worksheet.Cell(currentRow, 3).Value = "Hành động";
                worksheet.Cell(currentRow, 4).Value = "Nội dung";
                worksheet.Cell(currentRow, 5).Value = "Thiết bị";
                worksheet.Cell(currentRow, 6).Value = "Hệ điều hành";
                worksheet.Cell(currentRow, 7).Value = "IP Address";

                // Format headers
                var headerRange = worksheet.Range(1, 1, 1, 7);
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

                // Data
                int stt = 1;
                foreach (var log in logs)
                {
                    currentRow++;
                    worksheet.Cell(currentRow, 1).Value = stt++;
                    worksheet.Cell(currentRow, 2).Value = log.Timestamp.ToLocalTime().ToString("HH:mm dd/MM/yyyy");
                    worksheet.Cell(currentRow, 3).Value = log.Action;
                    worksheet.Cell(currentRow, 4).Value = log.Content;
                    worksheet.Cell(currentRow, 5).Value = log.Device.Length > 50 ? log.Device.Substring(0, 50) + "..." : log.Device;
                    worksheet.Cell(currentRow, 6).Value = log.OS;
                    worksheet.Cell(currentRow, 7).Value = log.IPAddress;
                }

                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }

        private string ParseOS(string userAgent)
        {
            if (string.IsNullOrEmpty(userAgent)) return "Unknown";
            if (userAgent.Contains("Windows")) return "Windows";
            if (userAgent.Contains("Android")) return "Android";
            if (userAgent.Contains("iPhone") || userAgent.Contains("iPad") || userAgent.Contains("Mac OS")) return "iOS/macOS";
            if (userAgent.Contains("Linux")) return "Linux";
            return "Other";
        }
    }
}
