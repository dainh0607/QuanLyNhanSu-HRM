using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestVehicleUsesConfiguration : IEntityTypeConfiguration<RequestVehicleUses>
    {
        public void Configure(EntityTypeBuilder<RequestVehicleUses> builder)
        {
            builder.ToTable("RequestVehicleUses");
            // Fluent API configurations go here
        }
    }
}
