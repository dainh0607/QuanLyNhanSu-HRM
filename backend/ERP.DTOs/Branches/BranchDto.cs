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
        public int? ParentId { get; set; }
        public string? ParentName { get; set; }
        public string? CountryCode { get; set; }
        public string? ProvinceCode { get; set; }
        public string? DistrictCode { get; set; }
        public string? Address { get; set; }
        public string? PhoneCountryPrefix { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ColorCode { get; set; }
        public int DisplayOrder { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BranchCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int? RegionId { get; set; }
        public int? ParentId { get; set; }
        public string? CountryCode { get; set; }
        public string? ProvinceCode { get; set; }
        public string? DistrictCode { get; set; }
        public string? Address { get; set; }
        public string? PhoneCountryPrefix { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ColorCode { get; set; }
        public int DisplayOrder { get; set; }
        public string? Note { get; set; }
    }

    public class BranchUpdateDto : BranchCreateDto { }
}
