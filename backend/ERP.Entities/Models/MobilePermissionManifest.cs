using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERP.Entities.Models
{
    [Table("MobilePermissionManifest")]
    public class MobilePermissionManifest : BaseEntity
    {
        [Column("parent_id")]
        public int? parent_id { get; set; }

        [ForeignKey("parent_id")]
        public virtual MobilePermissionManifest? Parent { get; set; }

        [Column("code")]
        [StringLength(100)]
        public string code { get; set; }

        [Column("name")]
        [StringLength(100)]
        public string name { get; set; }

        [Column("is_module")]
        public bool is_module { get; set; }

        [Column("display_order")]
        public int display_order { get; set; }

        public virtual ICollection<MobilePermissionManifest> Children { get; set; } = new HashSet<MobilePermissionManifest>();
    }
}
