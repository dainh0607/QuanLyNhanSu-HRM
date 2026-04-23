using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("InvitationTokens")]
    public class InvitationTokens : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }


        [Required]
        [StringLength(255)]
        [Column("token")]
        public string Token { get; set; }

        [Required]
        [StringLength(100)]
        [Column("email")]
        public string Email { get; set; }

        [Column("employee_id")]
        public int? EmployeeId { get; set; }

        [Required]
        [StringLength(255)]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Column("department_id")]
        public int? DepartmentId { get; set; }

        [Column("job_title_id")]
        public int? JobTitleId { get; set; }

        [Column("role_id")]
        public int? RoleId { get; set; }

        [Column("scope_level")]
        [StringLength(50)]
        public string? ScopeLevel { get; set; }

        [Column("branch_id")]
        public int? BranchId { get; set; }

        [Column("region_id")]
        public int? RegionId { get; set; }

        [Column("message")]
        public string? Message { get; set; }

        [ForeignKey("EmployeeId")]
        public virtual Employees? Employee { get; set; }

        [ForeignKey("DepartmentId")]
        public virtual Departments? Department { get; set; }

        [ForeignKey("JobTitleId")]
        public virtual JobTitles? JobTitle { get; set; }

        [ForeignKey("RoleId")]
        public virtual Roles? Role { get; set; }

        [ForeignKey("BranchId")]
        public virtual Branches? Branch { get; set; }

        [ForeignKey("RegionId")]
        public virtual Regions? Region { get; set; }

        [Column("expires_at")]
        public DateTime ExpiresAt { get; set; }

        [Column("is_used")]
        public bool IsUsed { get; set; }

        [Column("used_at")]
        public DateTime? UsedAt { get; set; }

        [Column("created_by")]
        public int CreatedBy { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual Users Creator { get; set; }
    }
}
