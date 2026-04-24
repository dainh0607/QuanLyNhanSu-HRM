namespace ERP.DTOs.Lookup
{
    public class EmploymentTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int? DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class EmploymentTypeCreateUpdateDto
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int? DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
