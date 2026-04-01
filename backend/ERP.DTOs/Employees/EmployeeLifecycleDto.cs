using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Employees
{
    public class ResignationRequestDto
    {
        [Required]
        public DateTime ResignationDate { get; set; }

        [Required]
        [StringLength(255)]
        public string Reason { get; set; }

        public string Note { get; set; }
    }

    public class PromotionRequestDto
    {
        [Required]
        public DateTime EffectiveDate { get; set; }

        public int? NewDepartmentId { get; set; }
        
        public int? NewJobTitleId { get; set; }

        public int? NewBranchId { get; set; }

        public decimal? NewSalaryAmount { get; set; }

        [StringLength(50)]
        public string DecisionNumber { get; set; }

        public string Note { get; set; }
    }
}
