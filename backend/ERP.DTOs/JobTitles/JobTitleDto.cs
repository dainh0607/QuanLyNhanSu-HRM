using System;

namespace ERP.DTOs.JobTitles
{
    public class JobTitleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int? ParentId { get; set; }
        public string? ParentName { get; set; }
        public int? BranchId { get; set; }
        public string? BranchName { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public string? Qualification { get; set; }
        public string? Experience { get; set; }
        public int DisplayOrder { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class JobTitleCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int? ParentId { get; set; }
        public int? BranchId { get; set; }
        public int? DepartmentId { get; set; }
        public string? Qualification { get; set; }
        public string? Experience { get; set; }
        public int DisplayOrder { get; set; }
        public string? Note { get; set; }
    }

    public class JobTitleUpdateDto : JobTitleCreateDto { }
}
