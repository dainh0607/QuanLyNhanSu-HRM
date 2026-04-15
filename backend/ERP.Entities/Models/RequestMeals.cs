using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestMeals")]
    public class RequestMeals : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("shift_id")]
        public int shift_id { get; set; }

        [ForeignKey("shift_id")]
        public virtual Shifts Shift { get; set; }

        [Column("number_of_meals")]
        public int number_of_meals { get; set; }

        [Column("meal_type_id")]
        public int? meal_type_id { get; set; }

        [ForeignKey("meal_type_id")]
        public virtual MealTypes MealType { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
