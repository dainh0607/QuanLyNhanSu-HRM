using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestTypesConfiguration : IEntityTypeConfiguration<RequestTypes>
    {
        public void Configure(EntityTypeBuilder<RequestTypes> builder)
        {
            builder.ToTable("RequestTypes");
            // Fluent API configurations go here
        }
    }
}
