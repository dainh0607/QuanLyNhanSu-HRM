using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Courses")]
    public class Courses : BaseEntity
    {
        [Column("course_name")]
        [StringLength(200)]
        public string course_name { get; set; }

        [Column("description")]
        public string description { get; set; }

        [Column("attachment")]
        [StringLength(500)]
        public string attachment { get; set; }
    }
}
