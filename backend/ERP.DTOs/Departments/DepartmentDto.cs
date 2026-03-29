using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Departments
{
    public class DepartmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public int? ParentId { get; set; }
    }

    public class DepartmentCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; }

        public int? ParentId { get; set; }
    }

    public class DepartmentUpdateDto
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        public int? ParentId { get; set; }
    }
}
