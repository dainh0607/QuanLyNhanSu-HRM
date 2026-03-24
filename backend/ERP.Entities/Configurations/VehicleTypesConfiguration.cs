using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class VehicleTypesConfiguration : IEntityTypeConfiguration<VehicleTypes>
    {
        public void Configure(EntityTypeBuilder<VehicleTypes> builder)
        {
            builder.ToTable("VehicleTypes");
            // Fluent API configurations go here
        }
    }
}
