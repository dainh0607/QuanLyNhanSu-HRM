using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    public abstract class AuditableEntity : BaseEntity
    {
        [Column("created_at")]
        public virtual DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public virtual DateTime? UpdatedAt { get; set; }
    }
}
