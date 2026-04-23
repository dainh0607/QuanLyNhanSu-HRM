using System;

namespace ERP.DTOs.Departments
{
    public class DepartmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int? BranchId { get; set; }
        public string? BranchName { get; set; }
        public int? ParentId { get; set; }
        public string? ParentName { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DepartmentCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int? BranchId { get; set; }
        public int? ParentId { get; set; }
        public string? Note { get; set; }
    }

    public class DepartmentUpdateDto : DepartmentCreateDto { }
}
