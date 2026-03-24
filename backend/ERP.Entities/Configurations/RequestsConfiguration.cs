using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestsConfiguration : IEntityTypeConfiguration<Requests>
    {
        public void Configure(EntityTypeBuilder<Requests> builder)
        {
            builder.ToTable("Requests");
            // Fluent API configurations go here
        }
    }
}
