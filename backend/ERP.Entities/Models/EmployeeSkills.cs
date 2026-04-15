using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("EmployeeSkills")]
    public class EmployeeSkills : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("skill_id")]
        public int skill_id { get; set; }

        [ForeignKey("skill_id")]
        public virtual Skills Skill { get; set; }

        [Column("level")]
        public int? level { get; set; }
    }
}
