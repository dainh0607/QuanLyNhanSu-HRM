using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestDeviceChangesConfiguration : IEntityTypeConfiguration<RequestDeviceChanges>
    {
        public void Configure(EntityTypeBuilder<RequestDeviceChanges> builder)
        {
            builder.ToTable("RequestDeviceChanges");
            // Fluent API configurations go here
        }
    }
}
