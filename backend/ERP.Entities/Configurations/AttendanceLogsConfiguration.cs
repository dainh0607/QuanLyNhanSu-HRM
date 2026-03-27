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

            builder.HasOne(al => al.Machine)
                .WithMany(tm => tm.AttendanceLogs)
                .HasForeignKey(al => al.machine_id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
