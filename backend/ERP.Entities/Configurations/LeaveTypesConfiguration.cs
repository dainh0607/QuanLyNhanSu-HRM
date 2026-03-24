using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class LeaveTypesConfiguration : IEntityTypeConfiguration<LeaveTypes>
    {
        public void Configure(EntityTypeBuilder<LeaveTypes> builder)
        {
            builder.ToTable("LeaveTypes");
            // Fluent API configurations go here
        }
    }
}
