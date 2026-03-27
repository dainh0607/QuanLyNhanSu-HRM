using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("PromotionHistory")]
    public class PromotionHistory : BaseEntity
    {
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

        [Column("city")]
        [StringLength(100)]
        public string city { get; set; }

        [Column("district")]
        [StringLength(100)]
        public string district { get; set; }

        [Column("branch_id")]
        public int? branch_id { get; set; }

        [ForeignKey("branch_id")]
        public virtual Branches? Branch { get; set; }

        [Column("department_id")]
        public int? department_id { get; set; }

        [ForeignKey("department_id")]
        public virtual Departments? Department { get; set; }

        [Column("job_title_id")]
        public int? job_title_id { get; set; }

        [ForeignKey("job_title_id")]
        public virtual JobTitles? JobTitle { get; set; }

        [Column("payment_method")]
        [StringLength(50)]
        public string payment_method { get; set; }

        [Column("salary_grade")]
        [StringLength(50)]
        public string salary_grade { get; set; }

        [Column("salary_amount")]
        public decimal? salary_amount { get; set; }

        [Column("allowance")]
        public string allowance { get; set; }

        [Column("other_income")]
        public string other_income { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
