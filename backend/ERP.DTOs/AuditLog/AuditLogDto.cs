using System;
using System.Collections.Generic;

namespace ERP.DTOs.AuditLog
{
    public class AuditLogDto
    {
        public int Id { get; set; }
        public int? EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public int? EntityId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string Device { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;
        public string Os { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
    }

    public class AuditLogFilterDto
    {
        public int? EmployeeId { get; set; }
        public string? Search { get; set; }
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public string? Action { get; set; }
        public int Skip { get; set; } = 0;
        public int Take { get; set; } = 20;
    }

    public class AuditLogListResultDto
    {
        public List<AuditLogDto> Items { get; set; } = new();
        public int Total { get; set; }
    }

    public class AuditLogCreateDto
    {
        public int? EmployeeId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public int? EntityId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
