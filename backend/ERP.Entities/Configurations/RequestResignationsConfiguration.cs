using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestResignationsConfiguration : IEntityTypeConfiguration<RequestResignations>
    {
        public void Configure(EntityTypeBuilder<RequestResignations> builder)
        {
            builder.ToTable("RequestResignations");
            // Fluent API configurations go here
        }
    }
}
