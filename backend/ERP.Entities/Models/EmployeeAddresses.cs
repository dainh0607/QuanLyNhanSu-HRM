using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmployeeAddresses")]
    public class EmployeeAddresses
    {
        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("address_id")]
        public int address_id { get; set; }

        [ForeignKey("address_id")]
        public virtual Addresses Address { get; set; }

        [Column("address_type_id")]
        public int address_type_id { get; set; }

        [ForeignKey("address_type_id")]
        public virtual AddressTypes AddressType { get; set; }

        [Column("is_current")]
        public bool is_current { get; set; }

        [Column("start_date")]
        public DateTime? start_date { get; set; }

        [Column("end_date")]
        public DateTime? end_date { get; set; }
    }
}
