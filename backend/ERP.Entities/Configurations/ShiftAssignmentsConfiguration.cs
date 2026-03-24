using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class ShiftAssignmentsConfiguration : IEntityTypeConfiguration<ShiftAssignments>
    {
        public void Configure(EntityTypeBuilder<ShiftAssignments> builder)
        {
            builder.ToTable("ShiftAssignments");
            // Fluent API configurations go here
        }
    }
}
