using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmployeeMobilePermissions")]
    public class EmployeeMobilePermissions : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("mobile_permission_id")]
        public int mobile_permission_id { get; set; }

        [ForeignKey("mobile_permission_id")]
        public virtual MobilePermissionManifest MobilePermission { get; set; }

        [Column("is_allowed")]
        public bool is_allowed { get; set; }
    }
}
