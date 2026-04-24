namespace ERP.DTOs.Lookup
{
    public class MealTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Keyword { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class MealTypeCreateUpdateDto
    {
        public string Name { get; set; } = null!;
        public string Keyword { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public int? DisplayOrder { get; set; }
    }
}
