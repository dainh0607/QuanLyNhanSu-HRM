using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestShiftChange")]
    public class RequestShiftChange
    {
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

        [Column("new_start_time")]
        public TimeSpan new_start_time { get; set; }

        [Column("start_next_day")]
        public bool start_next_day { get; set; }

        [Column("new_end_time")]
        public TimeSpan new_end_time { get; set; }

        [Column("end_next_day")]
        public bool end_next_day { get; set; }

        [Column("reason")]
        public string reason { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }
    }
}
