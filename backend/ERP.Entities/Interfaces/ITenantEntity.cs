using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Interfaces
{
    public interface ITenantEntity
    {
        [Column("tenant_id")]
        int? tenant_id { get; set; }
    }
}
