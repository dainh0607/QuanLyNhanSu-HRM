using System;
using System.Threading.Tasks;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;

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

        public async Task RecordLogAsync(string action, string entityType, int? entityId, string content)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var remoteIp = httpContext?.Connection?.RemoteIpAddress?.ToString() ?? "unknown";
            var userAgent = httpContext?.Request?.Headers["User-Agent"].ToString() ?? "unknown";

            var log = new AuditLogs
            {
                tenant_id = _userContext.TenantId,
                user_id = _userContext.UserId,
                action = action,
                entity_type = entityType,
                entity_id = entityId,
                content = content,
                ip_address = remoteIp,
                device = userAgent,
                timestamp = DateTime.UtcNow
            };

            await _unitOfWork.Repository<AuditLogs>().AddAsync(log);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
