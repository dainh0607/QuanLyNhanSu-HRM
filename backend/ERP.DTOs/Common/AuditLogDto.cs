using System;

namespace ERP.DTOs.Common
{
    public class AuditLogDto
    {
        public int Id { get; set; }
        public string Action { get; set; }
        public string EntityType { get; set; }
        public int? EntityId { get; set; }
        public string Content { get; set; }
        public string Device { get; set; }
        public string OS { get; set; }
        public string IPAddress { get; set; }
        public DateTime Timestamp { get; set; }
        public int? StatusCode { get; set; }
        public string? RequestUrl { get; set; }
    }
}
