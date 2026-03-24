using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class OpenShiftsConfiguration : IEntityTypeConfiguration<OpenShifts>
    {
        public void Configure(EntityTypeBuilder<OpenShifts> builder)
        {
            builder.ToTable("OpenShifts");
            // Fluent API configurations go here
        }
    }
}
