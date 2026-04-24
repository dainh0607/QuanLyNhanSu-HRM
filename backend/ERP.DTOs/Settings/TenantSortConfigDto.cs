using System.Collections.Generic;

namespace ERP.DTOs.Settings
{
    public class SortRuleDto
    {
        public string Field { get; set; } = null!;
        public string Order { get; set; } = "asc"; // asc, desc
    }

    public class TenantSortConfigDto
    {
        public List<SortRuleDto> Config { get; set; } = new();
    }
}
