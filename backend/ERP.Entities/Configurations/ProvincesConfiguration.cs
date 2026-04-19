using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class ProvincesConfiguration : IEntityTypeConfiguration<Provinces>
    {
        public void Configure(EntityTypeBuilder<Provinces> builder)
        {
            builder.ToTable("Provinces");

            // FIX: Configure code as an alternate key for foreign key relationships
            builder.HasAlternateKey(p => p.code)
                .HasName("AK_Provinces_code");

            // Relationship with Countries
            builder.HasOne(p => p.Country)
                .WithMany(c => c.Provinces)
                .HasForeignKey(p => p.country_code)
                .HasPrincipalKey(c => c.code)
                .OnDelete(DeleteBehavior.Restrict);

            // Relationship with Districts
            builder.HasMany(p => p.Districts)
                .WithOne(d => d.Province)
                .HasForeignKey(d => d.province_code)
                .HasPrincipalKey(p => p.code)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
