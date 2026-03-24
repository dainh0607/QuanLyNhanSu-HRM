using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class AttendanceRecordsConfiguration : IEntityTypeConfiguration<AttendanceRecords>
    {
        public void Configure(EntityTypeBuilder<AttendanceRecords> builder)
        {
            builder.ToTable("AttendanceRecords");
            // Fluent API configurations go here
        }
    }
}
