using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestsConfiguration : IEntityTypeConfiguration<Requests>
    {
        public void Configure(EntityTypeBuilder<Requests> builder)
        {
            builder.ToTable("Requests");

            builder.HasOne(r => r.Employee)
                .WithMany()
                .HasForeignKey(r => r.employee_id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.RequestType)
                .WithMany()
                .HasForeignKey(r => r.request_type_id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.ApprovedBy)
                .WithMany()
                .HasForeignKey(r => r.approved_by)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
