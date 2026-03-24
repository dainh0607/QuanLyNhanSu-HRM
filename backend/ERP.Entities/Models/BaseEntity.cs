using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    public abstract class BaseEntity : IBaseEntity<int>
    {
        [Key]
        [Column("id")]
        public virtual int Id { get; set; }
    }
}
