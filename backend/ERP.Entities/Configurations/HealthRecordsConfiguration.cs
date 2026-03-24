using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class HealthRecordsConfiguration : IEntityTypeConfiguration<HealthRecords>
    {
        public void Configure(EntityTypeBuilder<HealthRecords> builder)
        {
            builder.ToTable("HealthRecords");
            // Fluent API configurations go here
        }
    }
}
