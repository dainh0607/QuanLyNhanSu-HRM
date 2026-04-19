using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class CountriesConfiguration : IEntityTypeConfiguration<Countries>
    {
        public void Configure(EntityTypeBuilder<Countries> builder)
        {
            builder.ToTable("Countries");

            // FIX: Configure code as an alternate key for foreign key relationships
            builder.HasAlternateKey(c => c.code)
                .HasName("AK_Countries_code");

            // Relationship with Provinces
            builder.HasMany(c => c.Provinces)
                .WithOne(p => p.Country)
                .HasForeignKey(p => p.country_code)
                .HasPrincipalKey(c => c.code)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
