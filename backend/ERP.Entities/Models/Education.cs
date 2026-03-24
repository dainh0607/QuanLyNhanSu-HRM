using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Education")]
    public class Education : BaseEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("level")]
        [StringLength(50)]
        public string level { get; set; }

        [Column("major")]
        [StringLength(100)]
        public string major { get; set; }

        [Column("institution")]
        [StringLength(200)]
        public string institution { get; set; }

        [Column("issue_date")]
        public DateTime? issue_date { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
