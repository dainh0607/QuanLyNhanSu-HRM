using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Employees")]
    public class Employees : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_code")]
        [StringLength(20)]
        public string employee_code { get; set; }

        [Column("full_name")]
        [StringLength(100)]
        public string? full_name { get; set; }

        [Column("birth_date")]
        public DateTime? birth_date { get; set; }

        [Column("gender")]
        [StringLength(10)]
        public string? gender { get; set; }

        [Column("display_order")]
        public int? display_order { get; set; }

        [Column("email")]
        [StringLength(100)]
        public string? email { get; set; }

        [Column("phone")]
        [StringLength(20)]
        public string? phone { get; set; }

        [Column("home_phone")]
        [StringLength(20)]
        public string? home_phone { get; set; }

        [Column("facebook")]
        [StringLength(100)]
        public string? facebook { get; set; }

        [Column("skype")]
        [StringLength(100)]
        public string? skype { get; set; }

        [Column("identity_number")]
        [StringLength(20)]
        public string? identity_number { get; set; }

        [Column("identity_issue_date")]
        public DateTime? identity_issue_date { get; set; }

        [Column("identity_issue_place")]
        [StringLength(100)]
        public string? identity_issue_place { get; set; }

        [Column("passport")]
        [StringLength(20)]
        public string? passport { get; set; }

        [Column("ethnicity")]
        [StringLength(50)]
        public string? ethnicity { get; set; }

        [Column("religion")]
        [StringLength(50)]
        public string? religion { get; set; }

        [Column("nationality")]
        [StringLength(50)]
        public string? nationality { get; set; }

        [Column("origin_place")]
        [StringLength(255)]
        public string? origin_place { get; set; }

        [Column("tax_code")]
        [StringLength(20)]
        public string? tax_code { get; set; }

        [Column("marital_status")]
        [StringLength(20)]
        public string? marital_status { get; set; }

        [Column("union_member")]
        public bool union_member { get; set; }

        [Column("union_group")]
        [StringLength(100)]
        public string? union_group { get; set; }

        [Column("note")]
        public string? note { get; set; }

        [Column("start_date")]
        public DateTime? start_date { get; set; }

        [Column("work_type")]
        [StringLength(50)]
        public string? work_type { get; set; }

        [Column("seniority_months")]
        public int? seniority_months { get; set; }

        [Column("late_early_allowed")]
        public int? late_early_allowed { get; set; }

        [Column("late_early_note")]
        [StringLength(255)]
        public string? late_early_note { get; set; }

        [Column("is_resigned")]
        public bool is_resigned { get; set; }

        [Column("resignation_reason")]
        [StringLength(255)]
        public string? resignation_reason { get; set; }

        [Column("region_id")]
        public int? region_id { get; set; }

        [ForeignKey("region_id")]
        public virtual Regions? Region { get; set; }

        [Column("branch_id")]
        public int? branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches? Branch { get; set; }

        [Column("secondary_branch_id")]
        public int? secondary_branch_id { get; set; }

        [ForeignKey("secondary_branch_id")]
        public virtual Branches? SecondaryBranch { get; set; }

        [Column("department_id")]
        public int? department_id { get; set; }

        [ForeignKey("department_id")]
        public virtual Departments? Department { get; set; }

        [Column("secondary_department_id")]
        public int? secondary_department_id { get; set; }

        [ForeignKey("secondary_department_id")]
        public virtual Departments? SecondaryDepartment { get; set; }

        [Column("job_title_id")]
        public int? job_title_id { get; set; }

        [ForeignKey("job_title_id")]
        public virtual JobTitles? JobTitle { get; set; }

        [Column("secondary_job_title_id")]
        public int? secondary_job_title_id { get; set; }

        [ForeignKey("secondary_job_title_id")]
        public virtual JobTitles? SecondaryJobTitle { get; set; }

        [Column("manager_id")]
        public int? manager_id { get; set; }

        [ForeignKey("manager_id")]
        public virtual Employees? Manager { get; set; }

        public virtual ICollection<Employees> Subordinates { get; set; } = new HashSet<Employees>();

        [Column("is_active")]
        public bool is_active { get; set; }

        [Column("is_department_head")]
        public bool is_department_head { get; set; }

        [Column("gender_code")]
        [StringLength(10)]
        public string? gender_code { get; set; }

        [Column("marital_status_code")]
        [StringLength(10)]
        public string? marital_status_code { get; set; }

        [ForeignKey("gender_code")]
        public virtual Genders Gender { get; set; }

        [ForeignKey("marital_status_code")]
        public virtual MaritalStatuses MaritalStatus { get; set; }

        [Column("contract_sign_date")]
        public DateTime? contract_sign_date { get; set; }

        [Column("contract_expiry_date")]
        public DateTime? contract_expiry_date { get; set; }

        [Column("work_email")]
        [StringLength(100)]
        public string? work_email { get; set; }

        [Column("avatar", TypeName = "nvarchar(max)")]
        public string? avatar { get; set; }

        [Column("probation_start_date")]
        public DateTime? probation_start_date { get; set; }

        [Column("probation_end_date")]
        public DateTime? probation_end_date { get; set; }

        [Column("official_start_date")]
        public DateTime? official_start_date { get; set; }

        [Column("resignation_date")]
        public DateTime? resignation_date { get; set; }

        [Column("is_total_late_early_enabled")]
        public bool is_total_late_early_enabled { get; set; }

        [Column("is_separate_late_early_enabled")]
        public bool is_separate_late_early_enabled { get; set; }

        [Column("total_late_early_rules")]
        public string? total_late_early_rules { get; set; }

        [Column("late_rules")]
        public string? late_rules { get; set; }

        [Column("early_rules")]
        public string? early_rules { get; set; }

        [Column("allowed_late_minutes")]
        public int? allowed_late_minutes { get; set; }

        [Column("allowed_early_minutes")]
        public int? allowed_early_minutes { get; set; }
    }
}
