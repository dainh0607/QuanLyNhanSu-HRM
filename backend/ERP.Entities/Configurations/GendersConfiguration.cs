using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class GendersConfiguration : IEntityTypeConfiguration<Genders>
    {
        public void Configure(EntityTypeBuilder<Genders> builder)
        {
            builder.ToTable("Genders");
            
            builder.HasIndex(g => g.code)
                .IsUnique();
        }
    }
}
