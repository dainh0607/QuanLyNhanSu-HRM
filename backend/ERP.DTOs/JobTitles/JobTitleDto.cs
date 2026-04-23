using System;

namespace ERP.DTOs.JobTitles
{
    public class JobTitleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class JobTitleCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Note { get; set; }
    }

    public class JobTitleUpdateDto : JobTitleCreateDto { }
}
