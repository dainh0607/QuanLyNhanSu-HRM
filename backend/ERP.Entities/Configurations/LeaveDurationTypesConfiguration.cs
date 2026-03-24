using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class LeaveDurationTypesConfiguration : IEntityTypeConfiguration<LeaveDurationTypes>
    {
        public void Configure(EntityTypeBuilder<LeaveDurationTypes> builder)
        {
            builder.ToTable("LeaveDurationTypes");
            // Fluent API configurations go here
        }
    }
}
