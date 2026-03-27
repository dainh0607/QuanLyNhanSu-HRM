using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestLateEarly")]
    public class RequestLateEarly
    {
        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("location")]
        [StringLength(255)]
        public string location { get; set; }

        [Column("shift_id")]
        public int? shift_id { get; set; }

        [ForeignKey("shift_id")]
        public virtual Shifts Shift { get; set; }

        [Column("reason")]
        public string reason { get; set; }
    }
}
