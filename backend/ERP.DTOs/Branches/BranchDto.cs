using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Branches
{
    public class BranchDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Address { get; set; }
    }

    public class BranchCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; }

        [StringLength(255)]
        public string Address { get; set; }
    }

    public class BranchUpdateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [StringLength(255)]
        public string Address { get; set; }
    }
}
