using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class PayrollPeriodsConfiguration : IEntityTypeConfiguration<PayrollPeriods>
    {
        public void Configure(EntityTypeBuilder<PayrollPeriods> builder)
        {
            builder.ToTable("PayrollPeriods");
            // Fluent API configurations go here
        }
    }
}
