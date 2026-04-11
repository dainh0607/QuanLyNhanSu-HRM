using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("JobTitles")]
    public class JobTitles : BaseEntity
    {
        [Column("name")]
        [StringLength(200)]
        public string name { get; set; }

        [Column("code")]
        [StringLength(50)]
        public string code { get; set; }

        [Column("branch_id")]
        public int? branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches? Branch { get; set; }

        public virtual ICollection<Employees> Employees { get; set; } = new HashSet<Employees>();
    }
}
