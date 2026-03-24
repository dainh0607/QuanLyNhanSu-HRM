using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("RequestBorrowDetails")]
    public class RequestBorrowDetails : BaseEntity
    {
        [Column("borrow_id")]
        public int borrow_id { get; set; }

        [Column("item_name")]
        [StringLength(200)]
        public string item_name { get; set; }

        [Column("quantity")]
        public int quantity { get; set; }

        [Column("note")]
        public string note { get; set; }
    }
}
