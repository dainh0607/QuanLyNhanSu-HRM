using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class DistrictsConfiguration : IEntityTypeConfiguration<Districts>
    {
        public void Configure(EntityTypeBuilder<Districts> builder)
        {
            builder.ToTable("Districts");

            // FIX: Configure code as an alternate key for foreign key relationships
            builder.HasAlternateKey(d => d.code)
                .HasName("AK_Districts_code");

            // Relationship with Provinces
            builder.HasOne(d => d.Province)
                .WithMany(p => p.Districts)
                .HasForeignKey(d => d.province_code)
                .HasPrincipalKey(p => p.code)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
