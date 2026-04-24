using System.Collections.Generic;

namespace ERP.DTOs.Settings
{
    public class CustomFieldDto
    {
        public int Id { get; set; }
        public string FieldName { get; set; } = null!;
        public string FieldKey { get; set; } = null!;
        public string FieldType { get; set; } = null!;
        public List<string>? Options { get; set; }
        public bool IsActive { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class CustomFieldCreateUpdateDto
    {
        public string FieldName { get; set; } = null!;
        public string FieldType { get; set; } = null!;
        public List<string>? Options { get; set; }
        public bool IsActive { get; set; } = true;
        public int? DisplayOrder { get; set; }
    }
}
