using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class OvertimeTypesConfiguration : IEntityTypeConfiguration<OvertimeTypes>
    {
        public void Configure(EntityTypeBuilder<OvertimeTypes> builder)
        {
            builder.ToTable("OvertimeTypes");
            // Fluent API configurations go here
        }
    }
}
