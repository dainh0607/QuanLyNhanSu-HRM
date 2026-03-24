using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class AssetAllocationsConfiguration : IEntityTypeConfiguration<AssetAllocations>
    {
        public void Configure(EntityTypeBuilder<AssetAllocations> builder)
        {
            builder.ToTable("AssetAllocations");
            // Fluent API configurations go here
        }
    }
}
