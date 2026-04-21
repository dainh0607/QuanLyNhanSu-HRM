using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ERP.Entities.Interfaces;

namespace ERP.Entities.Models
{
    [Table("EmploymentHistoryLogs")]
    public class EmploymentHistoryLog : AuditableEntity, ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("employee_id")]
        public int employee_id { get; set; }

        [ForeignKey("employee_id")]
        public virtual Employees Employee { get; set; }

        [Column("effective_date")]
        public DateTime effective_date { get; set; }

        [Column("decision_type_id")]
        public int? decision_type_id { get; set; }

        [ForeignKey("decision_type_id")]
        public virtual DecisionTypes? DecisionType { get; set; }

        [Column("contract_type_id")]
        public int? contract_type_id { get; set; }

        [ForeignKey("contract_type_id")]
        public virtual ContractTypes? ContractType { get; set; }

        [Column("decision_number")]
        [StringLength(50)]
        public string decision_number { get; set; }

        [Column("work_status")]
        [StringLength(50)]
        public string work_status { get; set; }

        [Column("province_id")]
        public int? province_id { get; set; }

        [ForeignKey("province_id")]
        public virtual Provinces? Province { get; set; }

        [Column("district_id")]
        public int? district_id { get; set; }

        [ForeignKey("district_id")]
        public virtual Districts? District { get; set; }

        [Column("change_type")]
        [StringLength(100)]
        public string change_type { get; set; } // Chi nhánh, Phòng ban, Chức danh, Tiền lương, Phụ cấp, Thu nhập khác, Trạng thái, Hợp đồng

        [Column("note")]
        public string note { get; set; }
    }
}
