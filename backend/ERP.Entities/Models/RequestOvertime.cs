using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestOvertime")]
    public class RequestOvertime
    {
        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("overtime_type_id")]
        public int? overtime_type_id { get; set; }

        [ForeignKey("overtime_type_id")]
        public virtual OvertimeTypes OvertimeType { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("overtime_hours")]
        public decimal overtime_hours { get; set; }

        [Column("branch_id")]
        public int? branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches Branch { get; set; }

        [Column("break_start")]
        public TimeSpan? break_start { get; set; }

        [Column("break_end")]
        public TimeSpan? break_end { get; set; }

        [Column("reason")]
        public string reason { get; set; }

        [Column("handover_note")]
        public string handover_note { get; set; }
    }
}
