using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class TimeMachinesConfiguration : IEntityTypeConfiguration<TimeMachines>
    {
        public void Configure(EntityTypeBuilder<TimeMachines> builder)
        {
            builder.ToTable("TimeMachines");
            // Fluent API configurations go here
        }
    }
}
