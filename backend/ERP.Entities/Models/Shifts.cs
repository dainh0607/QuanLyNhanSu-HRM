using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Shifts")]
    public class Shifts : BaseEntity
    {
        [Column("shift_code")]
        [StringLength(20)]
        public string shift_code { get; set; }

        [Column("shift_name")]
        [StringLength(100)]
        public string shift_name { get; set; }

        [Column("start_time")]
        public TimeSpan start_time { get; set; }

        [Column("end_time")]
        public TimeSpan end_time { get; set; }

        [Column("color")]
        [StringLength(20)]
        public string color { get; set; }

        [Column("shift_type_id")]
        public int shift_type_id { get; set; }

        [ForeignKey("shift_type_id")]
        public virtual ShiftTypes ShiftType { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
