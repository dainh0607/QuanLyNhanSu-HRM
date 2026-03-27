using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestShiftRegister")]
    public class RequestShiftRegister
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

        [Column("note")]
        public string note { get; set; }
    }
}
