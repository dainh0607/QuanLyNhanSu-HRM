using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Users")]
    public class Users : AuditableEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("username")]
        [StringLength(50)]
        public string username { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }

        [Column("firebase_uid")]
        [StringLength(128)]
        public string firebase_uid { get; set; }
    }
}
