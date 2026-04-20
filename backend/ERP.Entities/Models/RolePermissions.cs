using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RolePermissions")]
    public class RolePermissions : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("role_id")]
        public int role_id { get; set; }

        [ForeignKey("role_id")]
        public virtual Roles Role { get; set; }

        [Column("permission_id")]
        public int permission_id { get; set; }

        [ForeignKey("permission_id")]
        public virtual Permissions Permission { get; set; }
    }
}
