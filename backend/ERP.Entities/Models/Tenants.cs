using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("Tenants")]
    public class Tenants : AuditableEntity
    {
        [Column("name")]
        [StringLength(200)]
        public string name { get; set; }

        [Column("code")]
        [StringLength(50)]
        public string code { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;

        [Column("subscription_expiry")]
        public DateTime? subscription_expiry { get; set; }
    }
}
