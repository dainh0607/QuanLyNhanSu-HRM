using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestShiftSwap")]
    public class RequestShiftSwap : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("shift_date")]
        public DateTime shift_date { get; set; }

        [Column("shift_id")]
        public int shift_id { get; set; }

        [ForeignKey("shift_id")]
        public virtual Shifts Shift { get; set; }

        [Column("target_employee_id")]
        public int target_employee_id { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
