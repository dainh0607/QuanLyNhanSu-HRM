using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class AttendanceLogsConfiguration : IEntityTypeConfiguration<AttendanceLogs>
    {
        public void Configure(EntityTypeBuilder<AttendanceLogs> builder)
        {
            builder.ToTable("AttendanceLogs");
            // Fluent API configurations go here
        }
    }
}
