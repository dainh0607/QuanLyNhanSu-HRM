using System;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.AuditLog;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.AuditLog
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AuditLogService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<AuditLogListResultDto> GetAuditLogsAsync(AuditLogFilterDto filter)
        {
            var query = _unitOfWork.Repository<AuditLogs>().AsQueryable();

            if (filter.EmployeeId.HasValue)
                query = query.Where(a => a.employee_id == filter.EmployeeId.Value);

            if (!string.IsNullOrEmpty(filter.Action))
                query = query.Where(a => a.action == filter.Action);

            if (!string.IsNullOrEmpty(filter.Search))
            {
                var search = filter.Search.ToLower();
                query = query.Where(a =>
                    a.content.ToLower().Contains(search) ||
                    a.device.ToLower().Contains(search) ||
                    a.ip_address.Contains(search));
            }

            if (!string.IsNullOrEmpty(filter.StartDate) && DateTime.TryParse(filter.StartDate, out var startDate))
                query = query.Where(a => a.timestamp >= startDate);

            if (!string.IsNullOrEmpty(filter.EndDate) && DateTime.TryParse(filter.EndDate, out var endDate))
                query = query.Where(a => a.timestamp <= endDate.Date.AddDays(1));

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(a => a.timestamp)
                .Skip(filter.Skip)
                .Take(filter.Take)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    EmployeeId = a.employee_id,
                    EmployeeName = a.Employee != null ? a.Employee.full_name : "",
                    Action = a.action,
                    EntityType = a.entity_type,
                    EntityId = a.entity_id,
                    Content = a.content,
                    Device = a.device,
                    MacAddress = a.mac_address,
                    Os = a.os,
                    IpAddress = a.ip_address,
                    Timestamp = a.timestamp.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            return new AuditLogListResultDto
            {
                Items = items,
                Total = total
            };
        }

        public async Task<int> CreateAuditLogAsync(AuditLogCreateDto dto, int? userId, string ipAddress, string device, string os, string macAddress)
        {
            var log = new AuditLogs
            {
                employee_id = dto.EmployeeId,
                user_id = userId,
                action = dto.Action,
                entity_type = dto.EntityType,
                entity_id = dto.EntityId,
                content = dto.Content,
                device = device ?? "",
                os = os ?? "",
                ip_address = ipAddress ?? "",
                mac_address = macAddress ?? "",
                timestamp = DateTime.UtcNow
            };

            await _unitOfWork.Repository<AuditLogs>().AddAsync(log);
            await _unitOfWork.SaveChangesAsync();
            return log.Id;
        }
    }
}
