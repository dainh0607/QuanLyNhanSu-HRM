namespace ERP.DTOs.Lookup
{
    public class AdvanceTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class AdvanceTypeCreateUpdateDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int? DisplayOrder { get; set; }
    }
}
