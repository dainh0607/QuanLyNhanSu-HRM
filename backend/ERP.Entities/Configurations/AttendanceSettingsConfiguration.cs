using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class AttendanceSettingsConfiguration : IEntityTypeConfiguration<AttendanceSettings>
    {
        public void Configure(EntityTypeBuilder<AttendanceSettings> builder)
        {
            builder.ToTable("AttendanceSettings");
            // Fluent API configurations go here
        }
    }
}
