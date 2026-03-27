using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class LeaveRequestsConfiguration : IEntityTypeConfiguration<LeaveRequests>
    {
        public void Configure(EntityTypeBuilder<LeaveRequests> builder)
        {
            builder.ToTable("LeaveRequests");

            builder.HasOne(r => r.LeaveDurationType)
                .WithMany()
                .HasForeignKey(r => r.duration_type_id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
