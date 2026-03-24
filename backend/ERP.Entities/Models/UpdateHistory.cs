using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("UpdateHistory")]
    public class UpdateHistory : BaseEntity
    {
        [Column("table_name")]
        [StringLength(100)]
        public string table_name { get; set; }

        [Column("record_id")]
        public int record_id { get; set; }

        [Column("action")]
        [StringLength(10)]
        public string action { get; set; }

        [Column("user_id")]
        public int? user_id { get; set; }

        [ForeignKey("user_id")]
        public virtual Users User { get; set; }

        [Column("change_time")]
        public DateTime change_time { get; set; }

        [Column("old_values")]
        public string old_values { get; set; }

        [Column("new_values")]
        public string new_values { get; set; }
    }
}
