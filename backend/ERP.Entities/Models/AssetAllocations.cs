using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("AssetAllocations")]
    public class AssetAllocations : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("asset_id")]
        public int asset_id { get; set; }

        [ForeignKey("asset_id")]
        public virtual Assets Asset { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("allocation_code")]
        [StringLength(50)]
        public string allocation_code { get; set; }

        [Column("allocation_date")]
        public DateTime allocation_date { get; set; }

        [Column("allocation_time")]
        public TimeSpan? allocation_time { get; set; }

        [Column("quantity")]
        public int quantity { get; set; }

        [Column("location")]
        [StringLength(200)]
        public string location { get; set; }

        [Column("handover_place")]
        [StringLength(200)]
        public string handover_place { get; set; }

        [Column("deposit")]
        public decimal? deposit { get; set; }

        [Column("note")]
        public string note { get; set; }

        [Column("return_date")]
        public DateTime? return_date { get; set; }
    }
}
