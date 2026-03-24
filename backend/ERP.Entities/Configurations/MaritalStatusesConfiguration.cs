using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class MaritalStatusesConfiguration : IEntityTypeConfiguration<MaritalStatuses>
    {
        public void Configure(EntityTypeBuilder<MaritalStatuses> builder)
        {
            builder.ToTable("MaritalStatuses");
            // Fluent API configurations go here
        }
    }
}
