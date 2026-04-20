using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AuditLogs")]
    public class AuditLogs : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int? employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual ERP.Entities.Models.Employees Employee { get; set; }

        [Column("user_id")]
        public int? user_id { get; set; }

        [Column("action")]
        [Required]
        [MaxLength(20)]
        public string action { get; set; } = string.Empty;

        [Column("entity_type")]
        [MaxLength(100)]
        public string entity_type { get; set; } = string.Empty;

        [Column("entity_id")]
        public int? entity_id { get; set; }

        [Column("content")]
        public string content { get; set; } = string.Empty;

        [Column("device")]
        [MaxLength(200)]
        public string device { get; set; } = string.Empty;

        [Column("mac_address")]
        [MaxLength(50)]
        public string mac_address { get; set; } = string.Empty;

        [Column("os")]
        [MaxLength(100)]
        public string os { get; set; } = string.Empty;

        [Column("ip_address")]
        [MaxLength(50)]
        public string ip_address { get; set; } = string.Empty;

        [Column("status_code")]
        public int? status_code { get; set; }

        [Column("request_url")]
        public string? request_url { get; set; }

        [Column("timestamp")]
        public DateTime timestamp { get; set; } = DateTime.UtcNow;
    }
}
