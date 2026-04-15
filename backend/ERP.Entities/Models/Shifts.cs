using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Shifts")]
    public class Shifts : BaseEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

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

        [Column("break_start")]
        public TimeSpan? break_start { get; set; }

        [Column("break_end")]
        public TimeSpan? break_end { get; set; }

        [Column("grace_period_in")]
        public int grace_period_in { get; set; }

        [Column("grace_period_out")]
        public int grace_period_out { get; set; }

        [Column("min_checkin_before")]
        public int min_checkin_before { get; set; }

        [Column("is_overnight")]
        public bool is_overnight { get; set; }

        [Column("color")]
        [StringLength(20)]
        public string color { get; set; }

        [Column("shift_type_id")]
        public int shift_type_id { get; set; }

        [ForeignKey("shift_type_id")]
        public virtual ShiftTypes ShiftType { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }

        [Column("default_branch_ids")]
        public string? default_branch_ids { get; set; }

        [Column("default_department_ids")]
        public string? default_department_ids { get; set; }

        [Column("default_job_title_ids")]
        public string? default_job_title_ids { get; set; }

        [Column("note")]
        public string? note { get; set; }
    }
}
