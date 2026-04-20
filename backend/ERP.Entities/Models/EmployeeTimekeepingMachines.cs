using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmployeeTimekeepingMachines")]
    public class EmployeeTimekeepingMachines : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("machine_id")]
        public int machine_id { get; set; }

        [ForeignKey("machine_id")]
        public virtual TimeMachines Machine { get; set; }

        [Column("timekeeping_code")]
        [StringLength(20)]
        public string timekeeping_code { get; set; }
    }
}
