using System.Collections.Generic;

namespace ERP.DTOs.Settings
{
    public class SystemFieldDto
    {
        public int Id { get; set; }
        public string FieldName { get; set; } = null!;
        public string FieldType { get; set; } = null!;
    }

    public class SystemFieldGroupDto
    {
        public string Category { get; set; } = null!;
        public int TotalFields { get; set; }
        public List<SystemFieldDto> Fields { get; set; } = new();
    }
}
