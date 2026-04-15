using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Auth
{
    public class RoleSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystemRole { get; set; }
        public int? TenantId { get; set; }
        public string ScopeLevel { get; set; }
    }

    public class RoleCreateUpdateDto
    {
        [Required(ErrorMessage = "Tên nhóm quyền là bắt buộc")]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(255)]
        public string Description { get; set; }

        public bool IsActive { get; set; } = true;

        [Required(ErrorMessage = "Cấp độ phạm vi là bắt buộc")]
        public string ScopeLevel { get; set; } // TENANT, REGION, BRANCH, DEPARTMENT, PERSONAL
    }

    public class PermissionMappingDto
    {
        public int RoleId { get; set; }
        public List<ActionPermissionDto> Actions { get; set; } = new List<ActionPermissionDto>();
        public List<ResourcePermissionDto> Resources { get; set; } = new List<ResourcePermissionDto>();
    }

    public class ActionPermissionDto
    {
        public string Action { get; set; } // CREATE, READ, UPDATE, DELETE
        public string Resource { get; set; } // EMPLOYEE, PAYROLL, etc.
        public string AllowedScope { get; set; } // SAME_TENANT, SAME_REGION, etc.
        public string Description { get; set; }
    }

    public class ResourcePermissionDto
    {
        public string ResourceName { get; set; }
        public string ScopeLevel { get; set; } // TENANT, REGION, etc.
    }

    public class UserRoleAssignmentDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int RoleId { get; set; }

        public int? RegionId { get; set; }
        public int? BranchId { get; set; }
        public int? DepartmentId { get; set; }

        public DateTime ValidFrom { get; set; } = DateTime.UtcNow;
        public DateTime? ValidTo { get; set; }
        
        public string AssignmentReason { get; set; }
    }

    public class PermissionLookupDto
    {
        public List<string> AvailableActions { get; set; }
        public List<string> AvailableResources { get; set; }
        public List<string> AvailableScopes { get; set; }
    }
}
