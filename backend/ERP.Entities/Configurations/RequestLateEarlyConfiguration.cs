using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestLateEarlyConfiguration : IEntityTypeConfiguration<RequestLateEarly>
    {
        public void Configure(EntityTypeBuilder<RequestLateEarly> builder)
        {
            builder.ToTable("RequestLateEarly");
            // Fluent API configurations go here
        }
    }
}
