using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestRewards")]
    public class RequestRewards : ERP.Entities.Interfaces.ITenantEntity
    {
        [Column("tenant_id")]
        public int? tenant_id { get; set; }

        [Key]
        [Column("request_id")]
        public int request_id { get; set; }

        [ForeignKey("request_id")]
        public virtual Requests Request { get; set; }

        [Column("title")]
        [StringLength(200)]
        public string title { get; set; }

        [Column("reward_type_id")]
        public int? reward_type_id { get; set; }

        [ForeignKey("reward_type_id")]
        public virtual RewardTypes RewardType { get; set; }

        [Column("amount")]
        public decimal amount { get; set; }

        [Column("decision_date")]
        public DateTime decision_date { get; set; }

        [Column("reason")]
        public string reason { get; set; }
    }
}
