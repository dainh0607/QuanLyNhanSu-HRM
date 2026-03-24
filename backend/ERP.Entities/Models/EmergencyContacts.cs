using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmergencyContacts")]
    public class EmergencyContacts : BaseEntity
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }

        [Column("relationship")]
        [StringLength(50)]
        public string relationship { get; set; }

        [Column("mobile_phone")]
        [StringLength(20)]
        public string mobile_phone { get; set; }

        [Column("home_phone")]
        [StringLength(20)]
        public string home_phone { get; set; }

        [Column("address")]
        [StringLength(255)]
        public string address { get; set; }
    }
}
