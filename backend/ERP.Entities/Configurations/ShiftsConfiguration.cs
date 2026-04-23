using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class ShiftsConfiguration : IEntityTypeConfiguration<Shifts>
    {
        public void Configure(EntityTypeBuilder<Shifts> builder)
        {
            builder.ToTable("Shifts");
            builder.HasIndex(s => s.keyword).IsUnique();
        }
    }
}
