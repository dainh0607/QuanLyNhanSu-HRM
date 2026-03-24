using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class MonthlyAttendanceSummaryConfiguration : IEntityTypeConfiguration<MonthlyAttendanceSummary>
    {
        public void Configure(EntityTypeBuilder<MonthlyAttendanceSummary> builder)
        {
            builder.ToTable("MonthlyAttendanceSummary");
            // Fluent API configurations go here
        }
    }
}
