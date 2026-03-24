using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestWorkTripsConfiguration : IEntityTypeConfiguration<RequestWorkTrips>
    {
        public void Configure(EntityTypeBuilder<RequestWorkTrips> builder)
        {
            builder.ToTable("RequestWorkTrips");
            // Fluent API configurations go here
        }
    }
}
