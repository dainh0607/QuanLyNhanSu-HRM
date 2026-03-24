using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class LocationHistoryConfiguration : IEntityTypeConfiguration<LocationHistory>
    {
        public void Configure(EntityTypeBuilder<LocationHistory> builder)
        {
            builder.ToTable("LocationHistory");
            // Fluent API configurations go here
        }
    }
}
