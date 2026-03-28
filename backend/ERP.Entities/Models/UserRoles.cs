using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("UserRoles")]
    public class UserRoles
    {
        [Column("user_id")]
        public int user_id { get; set; }

        [ForeignKey("user_id")]
        public virtual Users User { get; set; }

        [Column("role_id")]
        public int role_id { get; set; }

        [ForeignKey("role_id")]
        public virtual Roles Role { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
