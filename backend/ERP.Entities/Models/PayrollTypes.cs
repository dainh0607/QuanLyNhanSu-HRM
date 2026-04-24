using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("PayrollTypes")]
    public class PayrollTypes : AuditableEntity, ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Column("name")]
        [StringLength(100)]
        [Required]
        public string name { get; set; }

        [Column("code")]
        [StringLength(50)]
        public string code { get; set; }

        [Column("payment_type")]
        [StringLength(50)]
        public string payment_type { get; set; } // ONCE, HOURLY, MONTHLY, DAILY

        [Column("applicable_branches")]
        public string applicable_branches { get; set; }

        [Column("applicable_departments")]
        public string applicable_departments { get; set; }

        [Column("applicable_job_titles")]
        public string applicable_job_titles { get; set; }

        [Column("applicable_employees")]
        public string applicable_employees { get; set; }

        [Column("viewer_permissions")]
        public string viewer_permissions { get; set; } // Employee IDs who can view

        [Column("description")]
        [StringLength(500)]
        public string description { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; } = true;
    }
}
