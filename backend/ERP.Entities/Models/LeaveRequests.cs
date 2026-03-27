using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("LeaveRequests")]
    public class LeaveRequests : AuditableEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("leave_type_id")]
        public int leave_type_id { get; set; }

        [ForeignKey("leave_type_id")]
        public virtual LeaveTypes LeaveType { get; set; }

        [Column("duration_type_id")]
        public int? duration_type_id { get; set; }

        [ForeignKey("duration_type_id")]
        public virtual LeaveDurationTypes LeaveDurationType { get; set; }

        [Column("number_of_hours")]
        public decimal? number_of_hours { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("start_shift_id")]
        public int? start_shift_id { get; set; }

        [Column("end_shift_id")]
        public int? end_shift_id { get; set; }

        [Column("reason")]
        public string reason { get; set; }

        [Column("handover_employee_id")]
        public int? handover_employee_id { get; set; }

        [Column("handover_phone")]
        [StringLength(20)]
        public string handover_phone { get; set; }

        [Column("handover_note")]
        public string handover_note { get; set; }

        [Column("status")]
        [StringLength(20)]
        public string status { get; set; }

        [Column("approved_by")]
        public int? approved_by { get; set; }

        [Column("approved_at")]
        public DateTime? approved_at { get; set; }

        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }
    }
}
