using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class AttendanceModificationsConfiguration : IEntityTypeConfiguration<AttendanceModifications>
    {
        public void Configure(EntityTypeBuilder<AttendanceModifications> builder)
        {
            builder.ToTable("AttendanceModifications");
            // Fluent API configurations go here
        }
    }
}
