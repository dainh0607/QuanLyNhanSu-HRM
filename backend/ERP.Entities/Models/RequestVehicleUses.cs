using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestVehicleUses")]
    public class RequestVehicleUses : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("quantity")]
        public int quantity { get; set; }

        [Column("vehicle_type_id")]
        public int? vehicle_type_id { get; set; }

        [ForeignKey("vehicle_type_id")]
        public virtual VehicleTypes VehicleType { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("pickup_point")]
        [StringLength(255)]
        public string pickup_point { get; set; }

        [Column("destination")]
        [StringLength(255)]
        public string destination { get; set; }

        [Column("reason")]
        public string reason { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }
    }
}
