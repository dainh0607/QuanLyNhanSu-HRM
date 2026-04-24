namespace ERP.DTOs.Lookup
{
    public class DisciplineTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Keyword { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class DisciplineTypeCreateUpdateDto
    {
        public string Name { get; set; } = null!;
        public string Keyword { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int? DisplayOrder { get; set; }
    }
}
