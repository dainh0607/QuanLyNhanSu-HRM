using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class ShiftJobsConfiguration : IEntityTypeConfiguration<ShiftJobs>
    {
        public void Configure(EntityTypeBuilder<ShiftJobs> builder)
        {
            builder.ToTable("ShiftJobs");
            builder.HasIndex(e => new { e.tenant_id, e.code }).IsUnique();
        }
    }
}
