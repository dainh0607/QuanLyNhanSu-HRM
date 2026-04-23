using System;

namespace ERP.DTOs.Branches
{
    public class BranchDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int? RegionId { get; set; }
        public string? RegionName { get; set; }
        public string? Address { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BranchCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int? RegionId { get; set; }
        public string? Address { get; set; }
        public string? Note { get; set; }
    }

    public class BranchUpdateDto : BranchCreateDto { }
}
