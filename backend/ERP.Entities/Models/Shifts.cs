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

        [Column("keyword")]
        [StringLength(50)]
        public string keyword { get; set; }

        [Column("standard_effort")]
        public float standard_effort { get; set; }

        [Column("symbol")]
        [StringLength(10)]
        public string symbol { get; set; }

        [Column("checkin_window_start")]
        public TimeSpan? checkin_window_start { get; set; }

        [Column("checkin_window_end")]
        public TimeSpan? checkin_window_end { get; set; }

        [Column("checkout_window_start")]
        public TimeSpan? checkout_window_start { get; set; }

        [Column("checkout_window_end")]
        public TimeSpan? checkout_window_end { get; set; }

        [Column("allowed_late_mins")]
        public int allowed_late_mins { get; set; }

        [Column("allowed_early_mins")]
        public int allowed_early_mins { get; set; }

        [Column("max_late_mins")]
        public int? max_late_mins { get; set; }

        [Column("max_early_mins")]
        public int? max_early_mins { get; set; }

        [Column("checkin_requirement")]
        [StringLength(50)]
        public string? checkin_requirement { get; set; }

        [Column("checkout_requirement")]
        [StringLength(50)]
        public string? checkout_requirement { get; set; }

        [Column("timezone")]
        [StringLength(50)]
        public string timezone { get; set; } = "Asia/Saigon";

        [Column("start_date")]
        public DateTime? start_date { get; set; }

        [Column("end_date")]
        public DateTime? end_date { get; set; }

        [Column("min_working_hours")]
        public float min_working_hours { get; set; }

        [Column("meal_type_id")]
        public int? meal_type_id { get; set; }

        [ForeignKey("meal_type_id")]
        public virtual MealTypes MealType { get; set; }

        [Column("meal_count")]
        public int meal_count { get; set; }

        [Column("is_overtime_shift")]
        public bool is_overtime_shift { get; set; }
    }
}
