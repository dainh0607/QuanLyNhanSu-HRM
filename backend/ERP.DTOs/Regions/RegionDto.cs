using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Regions
{
    public class RegionDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }

    public class RegionCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; }
    }

    public class RegionUpdateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }
    }
}
