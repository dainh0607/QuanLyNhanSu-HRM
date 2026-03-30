using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.JobTitles
{
    public class JobTitleDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }

    public class JobTitleCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; }
    }

    public class JobTitleUpdateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }
    }
}
