using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class ShiftTypesConfiguration : IEntityTypeConfiguration<ShiftTypes>
    {
        public void Configure(EntityTypeBuilder<ShiftTypes> builder)
        {
            builder.ToTable("ShiftTypes");
            // Fluent API configurations go here
        }
    }
}
